/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

/*
    FLOW algorithms
*/
class FlowNode {
    constructor(index) {
        this.index = index;
        this.next = new Set();
        this.prev = new Set();
        this.size = 0;
        this.flow = 0;
        this.type = null;
        this.boundaries = null;
        this.max_flow = null;
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
}
var FLOW = {
    VERSION: "0.01",
    CSS: "color: #F3A",
    INI: {
        ORIGIN_SIZE: 0.2,
        //ORIGIN_FLOW: 512,
        //ORIGIN_FLOW: 1024,
        ORIGIN_FLOW: 2048,
    },
    layer: 'flood',
    map: null,
    GA: null,
    NA: null,
    init(map, origin) {
        this.map = map;
        this.GA = map.GA;
        this.make_NA();
        this.origin = origin;
        this.origin_index = this.GA.gridToIndex(this.origin);
        this.terminals = new Set([this.origin_index]);
        this.drains = new Set();
        this.excess_flow = 0;
        this.NA.G_set(this.origin, 'size', FLOW.INI.ORIGIN_SIZE);
        this.NA.G_set(this.origin, 'flow', FLOW.INI.ORIGIN_FLOW);
        this.NA.G_set(this.origin, 'type', 'UP');

        console.log(`%cFLOW initialized`, FLOW.CSS, FLOW.NA);
    },
    make_NA() {
        this.NA = new NodeArray(this.GA, FlowNode, [MAPDICT.EMPTY, MAPDICT.TRAP_DOOR, MAPDICT.DOOR]);
        this.map.NA = this.NA;
    },
    flow(lapsedTime, flow = FLOW.INI.ORIGIN_FLOW) {
        console.log("flow", lapsedTime, this.terminals);
        for (let n of this.terminals) {
            this.NA.I_set(n, 'flow', flow / this.terminals.size);
            this.calc_flow(n, lapsedTime);
        }
    },
    calc_flow(node, lapsedTime) {
        let NODE = this.NA.map[node];
        console.log("calc_flow", node, lapsedTime, NODE);
        let ga_value = this.GA.map[node];
        let max_h = GA_FLOW_MAP[ga_value];
        let min_h = GA_FLOW_MAP.MIN_FLOW;
        //console.log('..max-min h', min_h, max_h);
        let max_w, off_x;
        let min_w = 0;

        switch (this.NA.map[node].type) {
            case 'UP':
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
                throw "node type error";
            //console.error("node type error", this.NA.map[node]);
            //break;
        }
        console.log("..max-min w", min_w, max_w);
        //this.NA.map[node].boundaries = new Boundaries(min_w, max_w, min_h, max_h, off_x);
        NODE.boundaries = new Boundaries(min_w, max_w, min_h, max_h, off_x);
        let max_flow = NODE.boundaries.max_w * NODE.boundaries.max_h / (ENGINE.INI.GRIDPIX ** 2);
        NODE.max_flow = max_flow;

        //update flow!
        let flow_update = (lapsedTime / 1000 * (NODE.flow / ENGINE.INI.GRIDPIX ** 2)) * NODE.max_flow;
        NODE.size += flow_update;
        console.log('...flow_update', flow_update, NODE.size);
        this.overflow(node, NODE, lapsedTime);
        //back from overflow -> next_line;


    },
    overflow(node, NODE, lapsedTime) {
        //let max_flow = NODE.max_flow;
        console.log('..overflow');
        if (NODE.size > NODE.max_flow) {
            console.log("....spreading flow");
            let excess_flow = NODE.size - NODE.max_flow;
            NODE.size = NODE.max_flow;
            console.log(".....excess_flow", excess_flow);
            this.terminals.delete(node);

            if (this.GA.map[node] === MAPDICT.TRAP_DOOR) {
                console.log("trap door");
                return;
            }

            let grid = this.NA.indexToGrid(node).add(UP);
            if (this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL)) {
                console.log("wall or BLOCKWALL");
                return;
            }
            console.log("owerflow to next node");
            this.excess_flow += excess_flow;
            return this.next_line(grid, NODE, lapsedTime);
        }
    },
    next_line(grid, NODE, lapsedTime) {
        console.log("NEXT LINE", grid);
        let node = this.GA.gridToIndex(grid);
        let NEW = this.NA.map[node];
        NEW.type = "UP";

        let left = this.find_branch(node, LEFT, "LEFT");
        let right = this.find_branch(node, RIGHT, "RIGHT");
        console.log("...LR", left, right, Array.isArray(left), Array.isArray(right));
        let candidates;

        if (Array.isArray(left) && Array.isArray(right)) {
            console.log("$$$$$$$$$$$$$$$$$$$$$$\n.. cont on found line");
            NODE.next.add(node);
            NEW.prev.add(NODE.index);
            candidates = [node];

            for (let arr of [left, right]) {
                candidates = candidates.concat(arr);
                let N = node;
                for (let element of arr) {
                    this.NA.map[N].next.add(element);
                    this.NA.map[element].prev.add(N);
                    N = element;
                }
            }
            //console.log('candidates', candidates);
        } else {
            //deeper sources found
            console.log('#################\n..deeper sources found');
            let new_grids = [];
            if (!Array.isArray(left)) {
                new_grids.push(left);
            }
            if (!Array.isArray(right)) {
                new_grids.push(right);
            }
            for (let G of new_grids) {
                this.next_line(G, NODE);
            }
            return;
        }
        this.terminals = new Set(candidates);
        this.flow(lapsedTime, this.excess_flow);
        this.excess_flow = 0;
        //will fail at draw
        //throw "you are here";
    },
    dig_down(grid) {
        let next_down = grid.add(down);
        while (!this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL + MAPDICT.TRAP_DOOR)) {
            grid = next_down;
            next_down = grid.add(down);
        }
        return grid;
    },
    find_branch(node, dir, type) {
        let grid = this.GA.indexToGrid(node).add(dir);
        let line = [];
        let index;
        while (!this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL)) {
            index = this.GA.gridToIndex(grid);

            //door
            if (this.GA.check(grid, MAPDICT.DOOR)) {
                line.push(index);
                this.NA.map[index].type = type;
                return line;
            }
            let down_grid = grid.add(DOWN);

            if (!this.GA.check(down_grid, MAPDICT.WALL + MAPDICT.BLOCKWALL + MAPDICT.TRAP_DOOR)) {
                console.log("PATH DOWN", down_grid);
                return this.dig_down(down_grid);
            }

            line.push(index);
            this.NA.map[index].type = "UP";
            grid = grid.add(dir);
        }
        return line;
    },
    draw() {
        ENGINE.clearLayer(this.layer);
        this.next_node(this.origin_index);
    },
    next_node(node) {
        console.log("next draw:", node);
        this.draw_node(node);
        for (let n of this.NA.map[node].next) {
            this.next_node(n);
        }
    },
    draw_node(node) {
        const CTX = LAYER.flood;
        //console.log("drawing", node);
        let NODE = this.NA.map[node];
        let area = NODE.size * ENGINE.INI.GRIDPIX ** 2;
        let width = NODE.boundaries.max_w - NODE.boundaries.min_w;
        let height = Math.max(NODE.boundaries.min_h, Math.round(area / width));
        //console.log("..area, h", area, height);
        let grid = this.NA.indexToGrid(node);
        let point = GRID.gridToCoord(grid);
        point.toViewport();
        //console.log("..point", point);
        let drawStart = point.add(new Vector(NODE.boundaries.offX, ENGINE.INI.GRIDPIX - height));
        const pattern = CTX.createPattern(PATTERN.pattern.water.img, "repeat");
        CTX.fillStyle = pattern;
        CTX.fillRect(drawStart.x, drawStart.y, width, height);
    }
};

//END
console.log(`%cFLOW ${FLOW.VERSION} loaded.`, FLOW.CSS);