/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
/*jshint esversion: 11 */
"use strict";

/** 
    FLOW algorithms

    known issues, TODO:
        * all
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
    refresh() {
        this.fulness();
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
var FLOW = {
    VERSION: "III.1.1",
    CSS: "color: #F3A",
    DEBUG: true,
    PAINT_DISTANCES: true,
    INI: {
        ORIGIN_SIZE: 0.2,
        ORIGIN_FLOW: 4096,
        DRAIN_FACTOR: 2,
        EPSILON: 0.05,
        MIN_SIZE: 10 ** -6
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
        if (FLOW.DEBUG) console.log("setting node", node, NODE);
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
                console.error("node type error", NODE);
                break;
        }

        NODE.init(min_w, max_w, min_h, max_h, off_x);
        NODE.refresh();
    },
    flow(lapsedTime) {
        console.time("Flow");
        if (FLOW.DEBUG) {
            console.log("\n");
            console.log("********************************");
            console.log("***           FLOW           ***");
            console.log("********************************");
        }
        let STACK = [[this.origin_index]];
        let DRAIN_DEBT = [];
        let count = 0;
        let distance = 0;
        //let flow = this.INI.ORIGIN_FLOW;
        const drain_update = (lapsedTime / 1000 * ((FLOW.INI.ORIGIN_FLOW * FLOW.INI.DRAIN_FACTOR) / ENGINE.INI.GRIDPIX ** 2));
        const initial_flow = (lapsedTime / 1000 * (this.INI.ORIGIN_FLOW / ENGINE.INI.GRIDPIX ** 2));
        let flow = initial_flow;
        let PATH = new Int8Array(this.map.width * this.map.height);
        while (STACK.length > 0) {
            count++; // DEBUG

            if (FLOW.DEBUG) console.log("iteraton:", count, "distance:", distance, "flow:", flow);
            let LINE = STACK.pop();
            if (FLOW.DEBUG) console.log("LINE:", LINE);

            //if (count >= Infinity) {
            if (count >= 7) {
                console.warn("terminated for safety & debug");
                throw "DEBUG";
                //break;
            }

            DRAIN_DEBT.removeIfInArray(LINE);
            if (FLOW.DEBUG) console.log("DRAIN_DEBT before:", ...DRAIN_DEBT);

            let marks = new Int8Array(this.map.width * this.map.height);
            let line_above = this.get_line_above(LINE, marks);
            if (FLOW.DEBUG) console.log("line_above:", line_above);

            if (line_above.length > 0) {
                let borrowed_drain = this.borrow_drain(drain_update, line_above, DRAIN_DEBT);
                flow += borrowed_drain;
                if (FLOW.DEBUG) console.log("borrowed_drain:", borrowed_drain, "flow:", flow);
                if (FLOW.DEBUG) console.log("DRAIN_DEBT after:", ...DRAIN_DEBT);
            }

            let [line_below, drain_on_path] = this.line_below(drain_update, LINE, DRAIN_DEBT, PATH, marks);
            if (FLOW.DEBUG) console.log("line_below:", line_below, "drain_on_path:", drain_on_path);
            if (FLOW.DEBUG) console.log("DRAIN_DEBT after flowing down:", ...DRAIN_DEBT);
            flow += drain_on_path;

            if (line_below) {
                //line_below = this.extend_line(line_below, marks);
                //if (FLOW.DEBUG) console.log("line_below after extension:", line_below);
                if (FLOW.DEBUG) console.log("# Flow goes on: ", line_below);
                STACK.push(line_below);
                if (FLOW.DEBUG) console.log("\n-------------------");
                continue;
            }
            

            /*
                * (implicit no);
                * line ready to be processed; (what if meeting of drains and terminals)
                    * line has different levels:
                        * calc avg,min,max of *line*: *avg_line*, *min_line*, *max_line* (of fulness!)
                * apply total flow (flow+drain +excess) - to min levels
                * check min/max diff < E :
                    * set all to (min+max)/2

            */

            let [MIN, MAX] = this.analyze(LINE, "full");
            if (FLOW.DEBUG) console.log("LINE analysis", MIN, MAX);
            let min_line = this.filter_min_line(LINE, MIN);
            if (FLOW.DEBUG) console.log("min_line", min_line);
            if (FLOW.DEBUG) console.log("current FLOW", flow);


            this.apply_flow(min_line, distance, PATH, flow);
            distance++;

            /**
             * check min/max diff < E
             * not yet implemented
             */


            //

            let excess_flow = this.overflow(LINE);
            flow = excess_flow;
            if (FLOW.DEBUG) console.log("excess FLOW", excess_flow);

            if (line_above.length > 0 && flow > 0) {
                STACK.push(line_above);
            }


            //end while
            if (FLOW.DEBUG) console.log("\n-------------------");
        }

        if (FLOW.DEBUG) {
            console.log("********************************");
            console.log("\n");
        }
        console.timeEnd("Flow");
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
            if (FLOW.DEBUG) console.log("... NODE after overflow", node, "size", NODE.size, "fullness", NODE.full);
        }

        return excess_flow;
    },
    apply_flow(line, distance, PATH, flow) {
        //const flow_update = (lapsedTime / 1000 * (flow / ENGINE.INI.GRIDPIX ** 2));
        let F = flow / line.length;
        if (FLOW.DEBUG) console.log("..Applying flow ", flow, "per node:", F);
        for (let node of line) {
            PATH[node] = 1;
            let NODE = this.NA.map[node];
            NODE.distance = distance;
            NODE.size += F;
            NODE.refresh();
            if (FLOW.DEBUG) console.log("... NODE", node, "size", NODE.size, "fullness", NODE.full);
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
            borrow = drain_update * NODE.max_flow;
            NODE.size -= borrow;
            NODE.refresh();
            DRAIN_DEBT.push(node);
            if (FLOW.DEBUG) console.log("... draining node", node, "size", NODE.size, "full", NODE.full);
        }
        return borrow;

    },
    line_below(drain_update, line, DRAIN_DEBT, PATH, marks) {
        const DY = this.map.width;
        let below_line = [];
        for (let node of line) {
            let BELOW = this.NA.map[node + DY];
            if (BELOW && PATH[node + DY] === 0) {
                below_line.push(BELOW.index);
            }
        }
        if (below_line.length === 0) return [null, 0];

        let drain = 0;
        let dug = [];

        for (let d of below_line) {
            let add = true;
            let p = d;
            while (this.NA.map[d]) {
                if (PATH[d]) {
                    add = false;
                    break;
                }
                PATH[d] = 1;
                drain += this.drain_node(drain_update, DRAIN_DEBT, d);
                p = d;
                d += DY;
            }
            if (add) dug.push(p);
        }
        dug = this.extend_line(dug, marks);
        if (FLOW.DEBUG) console.log("...dug before extension", ...dug);
        for (let d of dug) {
            if (!PATH[d]) {
                PATH[d] = 1;
                drain += this.drain_node(drain_update, DRAIN_DEBT, d);
            }
        }
        if (FLOW.DEBUG) console.log("...dug after extension", ...dug);
        return [dug, drain];
    },
    analyze(node_list, property) {
        let min = Infinity;
        let max = -Infinity;
        for (let node of node_list) {
            let NODE = this.NA.map[node];
            if (NODE[property] > max) max = NODE[property];
            if (NODE[property] < min) min = NODE[property];
        }
        return [min, max];
    },
    borrow_drain(drain_update, line_above, DRAIN_DEBT) {
        let [min, max] = this.analyze(line_above, 'full');
        console.log("..Borrow: analysis", min, max);
        if (max === 0) return 0;
        let drain = 0;
        if (FLOW.DEBUG) console.log("..Borrowing drain", drain_update);
        for (let node of line_above) {
            drain += this.drain_node(drain_update, DRAIN_DEBT, node);
        }
        return drain;
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
    extend_line(line, marks) {
        let extended_line = [];
        for (let node of line) {
            extended_line = extended_line.concat(this.next_line(node, marks));
        }
        return extended_line;
    },
    next_line(node, marks) {
        marks[node] = 1;
        return [node, ...this.find_branch(node, -1, "LEFT", marks), ...this.find_branch(node, 1, "RIGHT", marks)];
    },
    find_branch(node, dir, type, marks) {
        let branch = [];
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
        console.time("DrawFlood");
        ENGINE.clearLayer(this.layer);
        for (let NODE of this.NA.map) {
            if (NODE) {
                this.draw_node(NODE);
                if (FLOW.PAINT_DISTANCES) this.mark_node(NODE);
            }
        }
        console.timeEnd("DrawFlood");
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