/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
/*jshint esversion: 11 */
"use strict";

/** 
    FLOW algorithm

    known issues, TODO:
        * 
*/
class FlowNode {
    constructor(index, grid) {
        this.index = index;
        this.grid = grid;
        this.size = 0;
        this.full = 0;
        this.type = 'STATIC';
        this.distance = -1;
        this.init();
    }
    init(min_w = 0, max_w = ENGINE.INI.GRIDPIX, min_h = 0, max_h = ENGINE.INI.GRIDPIX, off_x = 0) {
        this.boundaries = new Boundaries(min_w, max_w, min_h, max_h, off_x);
        this.max_flow = this.boundaries.max_flow();
    }
    fulness() {
        this.full = this.size / this.max_flow;
    }
    setFulness(full) {
        this.full = full;
        this.size = Math.roundFloat(this.full * this.max_flow, FLOW.INI.PRECISION);
    }
    refresh() {
        this.fulness();
        this.full = Math.roundFloat(this.full, FLOW.INI.PRECISION);
        this.size = Math.roundFloat(this.size, FLOW.INI.PRECISION);
    }
}
class Boundaries {
    constructor(min_w, max_w, min_h, max_h, off_x) {
        this.min_w = min_w;
        this.max_w = max_w;
        this.min_h = min_h;
        this.max_h = max_h;
        this.off_x = off_x;
    }
    max_flow() {
        return this.max_w * this.max_h / (ENGINE.INI.GRIDPIX ** 2);
    }
}
const FLOW = {
    VERSION: "1.00",
    CSS: "color: #F3A",
    DEBUG: true,
    PAINT_DISTANCES: false,
    INI: {
        ORIGIN_SIZE: 0.2,
        ORIGIN_FLOW: 4096,
        DRAIN_FACTOR: 2,
        EPSILON: 0.099,
        PRECISION: 6,
    },
    layer: 'flood',
    map: null,
    GA: null,
    NA: null,
    init(map, origin) {
        this.map = map;
        this.GA = map.GA;
        this.origin = origin;
        this.origin_level = this.origin.y;
        this.origin_index = this.GA.gridToIndex(this.origin);
        this.make_NA();
        this.NA.G_set(this.origin, 'size', FLOW.INI.ORIGIN_SIZE);
        console.log(`%cFLOW initialized`, FLOW.CSS, FLOW);
    },
    make_NA() {
        this.NA = new NodeArray(this.GA, FlowNode, [MAPDICT.EMPTY, MAPDICT.TRAP_DOOR, MAPDICT.DOOR], [MAPDICT.WATER]);
        this.map.NA = this.NA;
        this.set_node(this.origin_index);
    },

    set_node(node, type = 'UP') {
        let NODE = this.NA.map[node];
        if (!NODE) return;
        NODE.type = type;
        let ga_value = this.GA.iget_and_mask(node, MAPDICT.WATER);
        let max_h = GA_FLOW_MAP[ga_value];
        let min_h = GA_FLOW_MAP.MIN_FLOW;
        let max_w, off_x;
        let min_w = 0;

        switch (NODE.type) {
            case 'UP':
            case 'STATIC':
                max_w = ENGINE.INI.GRIDPIX;
                off_x = 0;
                break;
            case "LEFT":
                off_x = 39;
                max_w = ENGINE.INI.GRIDPIX - 28 - 11;
                break;
            case 'RIGHT':
                max_w = 28;
                off_x = 0;
                break;
            default:
                break;
        }

        NODE.init(min_w, max_w, min_h, max_h, off_x);
        NODE.refresh();
    },
    flow(lapsedTime) {
        let STACK = [[this.origin_index]];
        let DRAIN_DEBT = [];
        let distance = 0;
        const drain_update = (lapsedTime / 1000 * ((FLOW.INI.ORIGIN_FLOW * FLOW.INI.DRAIN_FACTOR) / ENGINE.INI.GRIDPIX ** 2));
        const initial_flow = (lapsedTime / 1000 * (this.INI.ORIGIN_FLOW / ENGINE.INI.GRIDPIX ** 2));
        let flow = initial_flow;
        let PATH = new Int8Array(this.map.width * this.map.height);

        while (STACK.length > 0) {
            let LINE = STACK.pop();
            let marks = new Int8Array(this.map.width * this.map.height);
            let line_above = this.get_line_above(LINE, marks);
            line_above = this.filter_line(line_above);
            line_above = this.reflow(line_above);

            if (line_above.length > 0) {
                let borrowed_drain = this.borrow_drain(drain_update, line_above, DRAIN_DEBT);
                flow += borrowed_drain;
            }

            let [line_below, drain_on_path] = this.line_below(drain_update, LINE, DRAIN_DEBT, PATH, marks);
            flow += drain_on_path;

            if (line_below) {
                for (let node of LINE) {
                    this.NA.map[node].distance = -1;
                }
                STACK.push(line_below);
                continue;
            }

            let [MIN, MAX, Analysis] = this.analyze(LINE, "full");

            if (Analysis.size > 2) {
                this.join(LINE, MIN, MAX, Analysis);
                [MIN, MAX, Analysis] = this.analyze(LINE, "full");
            }

            if (Math.abs(MIN - MAX) > this.INI.EPSILON) {
                LINE = this.filter_min_line(LINE, MIN);
            }

            this.apply_flow(LINE, distance, PATH, flow);
            DRAIN_DEBT.removeIfInArray(LINE);
            distance++;

            [MIN, MAX, Analysis] = this.analyze(LINE, "full");

            if ((MAX !== MIN) && Math.abs(MAX - MIN) <= this.INI.EPSILON) {
                let fullness = Math.roundFloat(this.sum_line(LINE, 'full') / LINE.length, this.INI.PRECISION);
                for (let node of LINE) {
                    let NODE = this.NA.map[node];
                    NODE.setFulness(fullness);
                }
            }

            flow = Math.roundFloat(this.overflow(LINE), this.INI.PRECISION);

            if (line_above.length > 0 && flow > 0) {
                STACK.push(line_above);
            }
        }

        let debt_level = new Set([...DRAIN_DEBT].map(x => Math.floor(x / this.map.width)));

        if (debt_level.size <= 1) {
            return;
        }

        let DEBT = this.filter_line(DRAIN_DEBT);

        while (DEBT.length > 0) {

            let marks = new Int8Array(this.map.width * this.map.height);
            let line_above = this.get_line_above(DEBT, marks);
            let available = this.sum_line(line_above, 'size');
            if (available === 0) break;

            let min_required = Math.roundFloat((1 - this.max_line(DEBT, 'size')) * DEBT.length, this.INI.PRECISION);

            if (available < min_required) {
                min_required = available;
            }

            this.change_flow(DEBT, min_required);
            this.change_flow(line_above, -min_required);
            DEBT = line_above;
        }
    },
    join(line, MIN, MAX, Analysis) {
        Analysis.delete(MAX);
        Analysis.delete(MIN);
        let mid = Analysis.first();
        let ref;
        if (MAX - mid < mid - MIN) {
            ref = MAX;
        } else {
            ref = MIN;
        }
        for (let node of line) {
            let NODE = this.NA.map[node];
            if (NODE.full === ref) {
                NODE.setFulness(mid);
            }
        }
    },
    max_line(line, prop) {
        let agg = -Infinity;
        for (let node of line) {
            if (this.NA.map[node][prop] > agg) agg = this.NA.map[node][prop];
        }
        return agg;
    },
    sum_line(line, prop) {
        let agg = 0;
        for (let node of line) {
            agg += this.NA.map[node][prop];
        }
        return agg;
    },
    reflow(line) {
        let local_marks = new Int8Array(this.map.width * this.map.height);
        let below = this.scan_line_downwards(line, local_marks);
        let below_extended = [];
        for (let node of below) {
            below_extended = below_extended.concat(this.next_line(node, local_marks));
        }

        if (below_extended.length > 0) {
            let distances = new Set();
            for (let d of below_extended) {
                distances.add(this.NA.map[d].distance);
            }
            if (distances.size == 2 && !distances.has(-1)) {
                let DIST = Math.min(...distances);
                let level = Math.floor(below_extended[0] / this.map.width);
                for (let i = level * this.map.width; i < (level + 1) * this.map.width; i++) {
                    let NODE = this.NA.map[i];
                    if (NODE) {
                        if (NODE.distance === DIST) {
                            if (!below_extended.includes(i)) {
                                below_extended.push(i);
                            }
                        }
                    }
                }
            }
        }

        return this.get_line_above(below_extended, local_marks);
    },
    double_line_test(line) {
        let conv = new Set(line.map(x => x % this.map.width));
        return line.length === conv.size;
    },
    filter_line(line, f = "max") {
        let filtered = [];
        let terminal_level = new Set([...line].map(x => Math.floor(x / this.map.width)));

        if (terminal_level.size === 1 || this.double_line_test(line)) {
            return line;
        } else {
            let MIN = Math[f](...terminal_level);
            for (let node of line) {
                if (Math.floor(node / this.map.width) === MIN) {
                    filtered.push(node);
                }
            }
            return filtered;
        }
    },
    overflow(line) {
        let excess_flow = 0;
        for (let node of line) {
            let NODE = this.NA.map[node];
            if (NODE.size > NODE.max_flow) {
                excess_flow += NODE.size - NODE.max_flow;
                NODE.size = NODE.max_flow;
                NODE.refresh();
            }
        }
        return excess_flow;
    },
    change_flow(line, flow) {
        let sumMF = this.sum_line(line, 'max_flow');
        for (let node of line) {
            let NODE = this.NA.map[node];
            let flow_change = Math.roundFloat(flow / sumMF * NODE.max_flow, this.INI.PRECISION);
            NODE.size += flow_change;
            NODE.refresh();
        }
    },
    apply_flow(line, distance, PATH, flow) {
        let sumMF = this.sum_line(line, 'max_flow');
        for (let node of line) {
            PATH[node] = 1;
            let NODE = this.NA.map[node];
            NODE.distance = distance;
            let flow_increase = Math.roundFloat(flow / sumMF * NODE.max_flow, this.INI.PRECISION);
            NODE.size += flow_increase;
            NODE.refresh();
        }
    },
    filter_min_line(line, min) {
        let min_line = [];
        for (let node of line) {
            if (this.NA.map[node].full === min) {
                min_line.push(node);
            }
        }
        return min_line;
    },
    drain_node(drain_update, DRAIN_DEBT, node) {
        let NODE = this.NA.map[node];
        let borrow = 0;
        if (NODE.size > 0) {
            borrow = Math.roundFloat(drain_update * NODE.max_flow, this.INI.PRECISION);
            NODE.size -= borrow;
            NODE.refresh();
            DRAIN_DEBT.push(node);
        }
        return borrow;

    },
    line_below(drain_update, line, DRAIN_DEBT, PATH, marks) {
        const DY = this.map.width;
        let drain = 0;
        let below_line = this.scan_line_downwards(line, PATH);
        if (below_line.length === 0) return [null, drain];
        let bottom_line = [];

        while (below_line.length > 0) {
            for (let i = below_line.length - 1; i >= 0; i--) {
                let node = below_line[i];
                let extended_line = this.next_line(node, marks);
                for (let node of extended_line) {
                    PATH[node] = 1;
                    drain += this.drain_node(drain_update, DRAIN_DEBT, node);
                }
                if (!(this.NA.map[node + DY] && PATH[node + DY] === 0)) {
                    below_line.remove(node);
                    bottom_line = bottom_line.concat(extended_line);
                }
            }

            below_line = this.scan_line_downwards(below_line, PATH);
        }
        bottom_line = bottom_line.unique();
        return [bottom_line, drain];
    },
    scan_line_downwards(line, PATH) {
        const DY = this.map.width;
        let below_line = [];
        for (let node of line) {
            let BELOW = this.NA.map[node + DY];
            if (BELOW && PATH[node + DY] === 0) {
                below_line.push(BELOW.index);
            }
        }
        return below_line;
    },
    analyze(node_list, property) {
        let analysis = new Set();
        let min = Infinity;
        let max = -Infinity;
        for (let node of node_list) {
            let NODE = this.NA.map[node];
            analysis.add(NODE[property]);
            if (NODE[property] > max) max = NODE[property];
            if (NODE[property] < min) min = NODE[property];
        }
        return [min, max, analysis];
    },
    borrow_drain(drain_update, line_above, DRAIN_DEBT) {
        let drain = 0;
        let [min, max] = this.analyze(line_above, 'full');
        if (max <= 0) return drain;

        for (let node of line_above) {
            drain += this.drain_node(drain_update, DRAIN_DEBT, node);
        }
        return Math.roundFloat(drain, this.INI.PRECISION);
    },
    get_line_above(line, marks) {
        const DY = this.map.width;
        let line_above = [];
        for (let node of line) {
            if (this.GA.icheck(node, MAPDICT.TRAP_DOOR)) continue;
            const above = node - DY;
            if (this.NA.map[above]) {
                if (marks[above] === 0) {
                    if (!this.GA.icheck(above, MAPDICT.WALL + MAPDICT.BLOCKWALL)) {
                        line_above = line_above.concat(this.next_line(above, marks));
                    }
                }
            }
        }
        return line_above;
    },
    next_line(node, marks) {
        marks[node] = 1;
        return [node, ...this.find_branch(node, -1, "LEFT", marks), ...this.find_branch(node, 1, "RIGHT", marks)];
    },
    find_branch(node, dir, type, marks) {
        let branch = [];
        marks[node] = 1;//
        node += dir;
        while (!this.GA.icheck(node, MAPDICT.WALL + MAPDICT.BLOCKWALL)) {
            marks[node] = 1;
            branch.push(node);
            if (this.GA.icheck(node, MAPDICT.DOOR)) {
                this.set_node(node, type);
                break;
            }
            node += dir;
        }
        return branch;
    },
    draw() {
        ENGINE.clearLayer(this.layer);
        for (let NODE of this.NA.map) {
            if (NODE) {
                this.draw_node(NODE);
                if (FLOW.PAINT_DISTANCES) this.mark_node(NODE);
            }
        }
    },
    draw_node(NODE) {
        const CTX = LAYER.flood;
        let area = NODE.size * ENGINE.INI.GRIDPIX ** 2;
        let width = NODE.boundaries.max_w - NODE.boundaries.min_w;
        let height = Math.max(NODE.boundaries.min_h, Math.round(area / width));
        let point = GRID.gridToCoord(NODE.grid);
        point.toViewport();
        let drawStart = point.add(new Vector(NODE.boundaries.off_x, ENGINE.INI.GRIDPIX - height));
        const pattern = CTX.createPattern(PATTERN.pattern.water.img, "repeat");
        CTX.fillStyle = pattern;
        CTX.fillRect(drawStart.x, drawStart.y, width, height);
    },
    mark_node(NODE) {
        let layer = "flood";
        let point = GRID.gridToCoord(NODE.grid);
        point.toViewport();
        GRID.paintText(point, NODE.distance, layer);
    },

};

//END
console.log(`%cFLOW ${FLOW.VERSION} loaded.`, FLOW.CSS);