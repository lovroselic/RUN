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
    VERSION: "III.1.0",
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
    //sizeMap: null,
    GA: null,
    NA: null,
    //flood_level: Infinity,
    init(map, origin) {
        this.map = map;
        this.GA = map.GA;
        this.origin = origin;
        this.origin_level = this.origin.y;
        this.origin_index = this.GA.gridToIndex(this.origin);
        //this.sizeMap = new Float32Array(this.map.width * this.map.height);
        //this.sizeMap[this.origin_index] = FLOW.INI.ORIGIN_SIZE;
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
        let flow = this.INI.ORIGIN_FLOW;
        let PATH = new Int8Array(this.map.width * this.map.height);
        while (STACK.length > 0) {
            count++; // DEBUG

            if (FLOW.DEBUG) console.log("iteraton:", count, "distance:", distance, "flow:", flow);
            let LINE = STACK.pop();
            if (FLOW.DEBUG) console.log("LINE:", LINE);
            DRAIN_DEBT.removeIfInArray(LINE);
            if (FLOW.DEBUG) console.log("DRAIN_DEBT before:", ...DRAIN_DEBT);

            let marks = new Int8Array(this.map.width * this.map.height);
            let line_above = this.get_line_above(LINE, marks);
            if (FLOW.DEBUG) console.log("line_above:", line_above);

            let borrowed_drain = this.borrow_drain(lapsedTime, line_above, DRAIN_DEBT) * this.INI.ORIGIN_FLOW;
            flow += borrowed_drain;
            if (FLOW.DEBUG) console.log("borrowed_drain:", borrowed_drain, "flow:", flow);
            if (FLOW.DEBUG) console.log("DRAIN_DEBT after:", ...DRAIN_DEBT);

            /*
                * check for down candidates: *down*
                * yes:
                    * put *down* candidates on stack
                    * continue
            */
            let [line_below, drain_on_path] = this.line_below(lapsedTime, LINE, DRAIN_DEBT, PATH);
            if (FLOW.DEBUG) console.log("line_below:", line_below, "drain_on_path:", drain_on_path);
            if (FLOW.DEBUG) console.log("DRAIN_DEBT after flowing down:", ...DRAIN_DEBT);

            if (line_below) {
                if (FLOW.DEBUG) console.log("# Flow goes on: ", line_below);
                STACK.push(line_below);
                continue;
            }


            //

            //end while
            if (FLOW.DEBUG) console.log("\n-------------------");
            if (count > 10) {
                console.warn("terminated for safety & debug");
                break;
            }
        }



        if (FLOW.DEBUG) {
            console.log("********************************");
            console.log("\n");
        }
        console.timeEnd("Flow");
    },
    line_below(lapsedTime, line, DRAIN_DEBT, PATH) {
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
        const drain_update = (lapsedTime / 1000 * ((-FLOW.INI.ORIGIN_FLOW * FLOW.INI.DRAIN_FACTOR) / ENGINE.INI.GRIDPIX ** 2));
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

                let NODE = this.NA.map[d];
                if (NODE.size > 0) {
                    let borrow = drain_update * NODE.max_flow;
                    NODE.size -= borrow;
                    drain += borrow;
                    DRAIN_DEBT.push(node);
                }

                p = d;
                d += DY;
            }
            if (add) dug.push(p);
        }
        return [dug, drain];
    },
    free_below() { },
    analyze(node_list, property) {
        let min = Infinity;
        let max = -Infinity;
        for (let node of node_list) {
            let NODE = this.NA.map[node];
            if (NODE[property] > max) max = NODE[property];
            else if (NODE[property] < min) min = NODE[property];
        }
        return [min, max];
    },
    borrow_drain(lapsedTime, line_above, DRAIN_DEBT) {
        let [min, max] = this.analyze(line_above, 'full');
        console.log("..Borrow: analysis", min, max);
        if (max === 0) return 0;
        let drain = 0;
        const drain_update = (lapsedTime / 1000 * ((-FLOW.INI.ORIGIN_FLOW * FLOW.INI.DRAIN_FACTOR) / ENGINE.INI.GRIDPIX ** 2));
        if (FLOW.DEBUG) console.log("..Borrowing drain", drain_update);
        for (let node of line_above) {

            let NODE = this.NA.map[node];
            if (NODE.size > 0) {
                let borrow = drain_update * NODE.max_flow;
                NODE.size -= borrow;
                drain += borrow;
                DRAIN_DEBT.push(node);
            }

        }
        return drain;
    },
    get_line_above(line, marks) {
        const DY = this.map.width;
        let line_above = [];
        for (let node of line) {
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