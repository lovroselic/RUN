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
        //this.y = null;
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
    VERSION: "0.02",
    CSS: "color: #F3A",
    INI: {
        ORIGIN_SIZE: 0.2,
        //ORIGIN_FLOW: 512,
        //ORIGIN_FLOW: 1024,
        //ORIGIN_FLOW: 2048,
        ORIGIN_FLOW: 4096,
        DRAIN_FACTOR: 2,
    },
    layer: 'flood',
    map: null,
    GA: null,
    NA: null,
    flood_level: Infinity,
    //flood_level_flag: false,
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
        this.set_flood_level(this.origin.y);

        console.log(`%cFLOW initialized`, FLOW.CSS, FLOW.NA);
    },
    make_NA() {
        this.NA = new NodeArray(this.GA, FlowNode, [MAPDICT.EMPTY, MAPDICT.TRAP_DOOR, MAPDICT.DOOR]);
        this.map.NA = this.NA;
    },
    set_flood_level(level) {
        if (level < this.flood_level) {
            this.flood_level = level;
        }
    },
    flow(lapsedTime, flow = FLOW.INI.ORIGIN_FLOW) {
        //debug
        console.log("\n..........................");
        console.log("flow", lapsedTime);
        console.log("drains:");
        for (let d of this.drains) {
            console.log(d, "->", this.NA.indexToGrid(d));
        }

        /*if (this.flood_level_flag) this.flood_level++;
        this.flood_level_flag = false;*/

        console.log("terminals:");
        for (let t of this.terminals) {
            console.log(t, "->", this.NA.indexToGrid(t));
        }
        //debug end
        console.log("..........................,,,,,,,,,,\n");
        //add drain
        //calc drain size
        for (let d of this.drains) {
            this.NA.I_set(d, 'flow', -FLOW.INI.ORIGIN_FLOW * FLOW.INI.DRAIN_FACTOR);
            this.calc_flow(d, lapsedTime);
        }
        this.excess_flow += FLOW.INI.ORIGIN_FLOW * FLOW.INI.DRAIN_FACTOR * this.drains.size;
        //
        for (let n of this.terminals) {
            this.NA.I_set(n, 'flow', (flow + this.excess_flow) / this.terminals.size);
            this.calc_flow(n, lapsedTime);
        }
        this.excess_flow = 0;
        if (this.terminals.size === 0 && this.drains.size > 0){
            this.terminals = this.drains;
            this.drains = new Set();
        }
    },
    calc_flow(node, lapsedTime) {
        let NODE = this.NA.map[node];
        let ga_value = this.GA.map[node];
        let max_h = GA_FLOW_MAP[ga_value];
        let min_h = GA_FLOW_MAP.MIN_FLOW;
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
                console.error("node type error", this.NA.map[node]);
                break;
        }
        NODE.boundaries = new Boundaries(min_w, max_w, min_h, max_h, off_x);
        let max_flow = NODE.boundaries.max_w * NODE.boundaries.max_h / (ENGINE.INI.GRIDPIX ** 2);
        NODE.max_flow = max_flow;

        let flow_update = (lapsedTime / 1000 * (NODE.flow / ENGINE.INI.GRIDPIX ** 2)) * NODE.max_flow;
        NODE.size += flow_update;
        this.overflow(node, NODE, lapsedTime);
        //back from overflow -> next_line;
    },
    overflow(node, NODE, lapsedTime) {
        if (NODE.size > NODE.max_flow) {
            let excess_flow = NODE.size - NODE.max_flow;
            NODE.size = NODE.max_flow;
            this.terminals.delete(node);

            if (this.GA.map[node] === MAPDICT.TRAP_DOOR) return;
            let grid = this.NA.indexToGrid(node).add(UP);
            if (this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL)) return;
            if (this.NA.map[this.NA.gridToIndex(grid)].size > 0) return;

            //terminate if not last that reached flood level
            //and  there are terminals lower than flood level

            if (this.terminals.size > 0 && this.any_terminal_lower() && grid.y < this.flood_level) {
                return;
            }

            this.excess_flow += excess_flow;
            return this.next_line(grid, NODE, lapsedTime);
        }
        //if implied level and close to the rest, draining stops and line rebalances and drains -> terminals
        //watch for //if it has next() pointing downwards, it can only be side branch not top!!!
        //
        //

        if (NODE.size <= 0) {
            NODE.size = 0;
            let levelOfPrevious = this.NA.indexToGrid(NODE.prev.first()).y;
            if (levelOfPrevious < this.impliedLevel && levelOfPrevious > this.NA.indexToGrid(NODE.index).y) {
                console.log("..... set new drains NODE: ",
                    NODE, this.NA.indexToGrid(NODE.index),
                    "levelOfPrevious", levelOfPrevious,
                    "this.NA.indexToGrid(NODE.index).y", this.NA.indexToGrid(NODE.index).y,
                    "this.impliedLevel", this.impliedLevel, "\n");
                this.flood_level = levelOfPrevious;
                this.next_line_flooded(NODE.prev.first());
            }
            clearNode(NODE);
            return;
        }

        function clearNode(NODE) {
            FLOW.NA.map[NODE.prev.first()].next.delete(NODE.index);
            NODE.next.clear();
            NODE.prev.clear();
            FLOW.drains.delete(NODE.index);
        }
    },
    any_terminal_lower(level = this.flood_level) {
        for (let T of this.terminals) {
            if (this.NA.indexToGrid(T).y > level) {
                return true;
            }
        }
        return false;
    },
    next_line_flooded(index) {
        console.log("next_line_flooded", index, this.NA.indexToGrid(index));
        let left = this.find_branch_flooded(index, LEFT);
        let right = this.find_branch_flooded(index, RIGHT);
        let candidates = [index, ...left, ...right];
        this.drains.addArray(candidates);
    },
    next_line(grid, NODE, lapsedTime = 17) {
        console.log("NEXT LINE", grid);
        let node = this.GA.gridToIndex(grid);
        let NEW = this.NA.map[node];
        NEW.type = "UP";

        let left = this.find_branch(node, LEFT, "LEFT");
        let right = this.find_branch(node, RIGHT, "RIGHT");
        let candidates;

        if (Array.isArray(left) && Array.isArray(right)) {
            this.set_flood_level(this.NA.indexToGrid(node).y);
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
        } else {
            //deeper sources found
            let new_grids = [];
            if (!Array.isArray(left)) {
                new_grids.push(left);
            }
            if (!Array.isArray(right)) {
                new_grids.push(right);
            }
            for (let G of new_grids) {
                this.next_line(G, NODE, lapsedTime);
            }
            return;
        }

        this.terminals.addArray(candidates);
        this.excess_flow = Math.max(0.001, this.excess_flow);
        this.flow(lapsedTime, 0);
    },
    dig_down(grid) {
        let next_down = grid.add(DOWN);
        while (!this.GA.check(next_down, MAPDICT.WALL + MAPDICT.BLOCKWALL + MAPDICT.TRAP_DOOR)) {
            grid = next_down;
            next_down = grid.add(DOWN);
        }
        return grid;
    },
    find_branch_flooded(node, dir) {
        let grid = this.GA.indexToGrid(node).add(dir);
        let line = [];
        let index = this.NA.gridToIndex(grid);
        while (!this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL)) {
            if (this.NA.map[index].size === 0) break;
            line.push(index);
            grid = grid.add(dir);
            index = this.NA.gridToIndex(grid);
        }
        return line;
    },
    find_branch(node, dir, type) {
        let grid = this.GA.indexToGrid(node).add(dir);
        let line = [];
        let index;
        while (!this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL)) {
            index = this.GA.gridToIndex(grid);

            //stop if flooded
            if (this.NA.map[index].size > 0) return line;

            //door
            if (this.GA.check(grid, MAPDICT.DOOR)) {
                line.push(index);
                this.NA.map[index].type = type;
                return line;
            }
            let down_grid = grid.add(DOWN);

            if (!this.GA.check(down_grid, MAPDICT.WALL + MAPDICT.BLOCKWALL + MAPDICT.TRAP_DOOR)) {
                console.log("PATH DOWN", down_grid);
                //check if flooded
                if (this.NA.map[this.NA.gridToIndex(down_grid)].size === 0) {
                    return this.dig_down(down_grid);
                } else {
                    console.log(down_grid, "flooded?",
                        this.NA.map[this.NA.gridToIndex(down_grid)].size,
                        this.NA.map[this.NA.gridToIndex(down_grid)].index,
                        this.NA.map[this.NA.gridToIndex(down_grid)].size === 0);
                }
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
        //console.log("next draw:", node);
        this.draw_node(node);
        for (let n of this.NA.map[node].next) {
            this.next_node(n);
        }
    },
    draw_node(node) {
        const CTX = LAYER.flood;
        let NODE = this.NA.map[node];
        let area = NODE.size * ENGINE.INI.GRIDPIX ** 2;
        let width = NODE.boundaries.max_w - NODE.boundaries.min_w;
        let height = Math.max(NODE.boundaries.min_h, Math.round(area / width));
        let grid = this.NA.indexToGrid(node);
        let point = GRID.gridToCoord(grid);
        point.toViewport();
        let drawStart = point.add(new Vector(NODE.boundaries.offX, ENGINE.INI.GRIDPIX - height));
        const pattern = CTX.createPattern(PATTERN.pattern.water.img, "repeat");
        CTX.fillStyle = pattern;
        CTX.fillRect(drawStart.x, drawStart.y, width, height);
    },
    reFlow(index, which) {
        console.log("\n#############################################");
        console.warn("ReFlow", index, which);
        let grid = this.GA.indexToGrid(index);
        console.log("grid.y, this.flood_level", grid.y, this.flood_level);
        let correction = 0;
        if (which === MAPDICT.DOOR) correction = 1;
        let impliedLevel = grid.y + correction;
        this.impliedLevel = impliedLevel; //TBC
        if (this.flood_level < impliedLevel) {
            //reflow
            if (this.terminals.size > 0 && this.drains.size === 0) {
                this.drains.moveFrom(this.terminals);
            } else {
                //to be implemented!!!
                throw "set drains from floodlevel";
            }
            console.log("drains set", this.drains);
            return this.next_line(grid, this.NA.map[this.origin_index]);
        } else if (this.flood_level === impliedLevel) {
            return this.next_line(this.dig_down(grid), this.NA.map[this.origin_index]);
        } else {
            console.log("REFLOW Not applicable");
        }

        //throw "REFLOW";
    }
};

//END
console.log(`%cFLOW ${FLOW.VERSION} loaded.`, FLOW.CSS);