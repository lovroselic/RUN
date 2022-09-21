/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
/*jshint esversion: 11 */
"use strict";

/** 
    FLOW algorithms

    known issues, TODO:
    * draining shoul stop if terminal got to same level or higher
    * join on max size not only on terminal size!!???
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
    VERSION: "0.04",
    CSS: "color: #F3A",
    INI: {
        ORIGIN_SIZE: 0.2,
        ORIGIN_FLOW: 4096,
        DRAIN_FACTOR: 2,
        EPSILON: 0.05,
    },
    layer: 'flood',
    map: null,
    GA: null,
    NA: null,
    flood_level: Infinity,
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
            console.log("* setting flood level from set FL", this.flood_level);
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


        console.log("terminals:");
        for (let t of this.terminals) {
            console.log(t, "->", this.NA.indexToGrid(t));
        }
        //debug end
        console.log(",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n");


        //////////////////////////////////////////////////
        /*
        if (this.drains.size > 0) {
            console.log("check if drains are above terminals and linking is not applicable", this.impliedLevel - 1, this.flood_level, this.impliedLevel - 1 > this.flood_level);
            if (this.impliedLevel - 1 > this.flood_level) {
                let toMove = [];
                for (let D of this.drains) {
                    let drainLevel = Math.floor(D / this.map.width);
                    console.log("D, drainLevel", D, drainLevel, this.flood_level, "IL", this.impliedLevel);
                    console.log("CASE", this.flood_level, this.impliedLevel - 1, this.impliedLevel - 1 === this.flood_level);
                    if (drainLevel >= this.flood_level) {
                        toMove.push(D);
                    }
                }
                this.terminals.addArray(toMove);
                this.drains.removeArray(toMove);
            }
        }
        */

        /*if (this.terminals.size === 0 && this.drains.size > 0) {
            console.log("drains -> terminals");
            this.terminals = this.drains;
            this.drains = new Set();
        }*/

        console.log("will check for links ...", this.terminals.size, this.drains.size, this.terminals.size > 0 && this.drains.size > 0);
        if (this.terminals.size > 0 && this.drains.size > 0) {
            console.log("checking for links", this.impliedLevel, this.flood_level, this.impliedLevel - 1 === this.flood_level);
            if (this.impliedLevel - 1 === this.flood_level) {
                for (let T of this.terminals) {
                    let terminalLevel = Math.floor(T / this.map.width);
                    console.log("T, terminalLevel", T, terminalLevel, this.flood_level);
                    if (terminalLevel === this.flood_level) {
                        console.log("..size", T, this.NA.map[T].size);
                        console.log("check linking!!!!");
                        let DrainCandidates = [];
                        if (this.drains.has(T - 1)) {
                            DrainCandidates.push(T - 1);
                        }
                        if (this.drains.has(T + 1)) {
                            DrainCandidates.push(T + 1);
                        }
                        if (DrainCandidates.length > 0) {
                            for (let D of DrainCandidates) {
                                console.log(T, "->", D);
                                this.link_stream(T, D);
                            }
                        } else {
                            throw "HERE";
                        }
                        break;

                    }
                }
            }
        }

        //what if no terminals?
        if (this.terminals.size === 0) {
            this.NA_to_GA();
            //iterate on flood_level
            let startIndex = this.flood_level * this.map.width;
            for (let i = startIndex; i < startIndex + this.map.width; i++) {
                if (this.NA.map[i]?.size === 1) {
                    let t = i - this.map.width;
                    if (t > 0 && this.NA.map[t]?.size === 0) {
                        //only if it can flow upward
                        console.log("candidate for creating terminal->", this.NA.indexToGrid(i), i, "- >", t);
                        ///only if path to origin
                        let NM = this.GA.findPath_AStar_fast(this.NA.indexToGrid(i), this.origin, [MAPDICT.WATER]);
                        if (NM !== null) {
                            this.terminals.add(i);
                        }
                    }
                }
            }
        }

        //add drain
        //calc drain size
        for (let d of this.drains) {
            this.NA.I_set(d, 'flow', -FLOW.INI.ORIGIN_FLOW * FLOW.INI.DRAIN_FACTOR);
            this.calc_flow(d, lapsedTime);
        }
        this.excess_flow += FLOW.INI.ORIGIN_FLOW * FLOW.INI.DRAIN_FACTOR * this.drains.size;

        for (let n of this.terminals) {
            this.NA.I_set(n, 'flow', (flow + this.excess_flow) / this.terminals.size);
            this.calc_flow(n, lapsedTime);
        }
        this.excess_flow = 0;

        if (this.terminals.size === 0 && this.drains.size > 0) {
            console.log("drains -> terminals");
            this.terminals = this.drains;
            this.drains = new Set();
        }
        return;
    },
    link_stream(terminal, drain) {
        console.log('link_stream terminal, drain', terminal, drain);
        let T_NODE = this.NA.map[terminal];
        let D_NODE = this.NA.map[drain];
        let terminalLevel = Math.floor(terminal / this.map.width);
        if (D_NODE.size - FLOW.INI.EPSILON > T_NODE.size) return;
        let linked = [];
        let dindex = drain;
        let tindex = terminal;
        //follow prev, while same level
        while (Math.floor(this.NA.map[dindex].prev.first() / this.map.width) === terminalLevel) {
            linked.push(dindex);
            let next = this.NA.map[dindex].prev.first();
            this.NA.map[tindex].next.add(dindex);
            this.NA.map[dindex].prev.add(tindex);
            this.NA.map[dindex].prev.delete(next);
            this.NA.map[next].next.delete(dindex);
            tindex = dindex;
            dindex = next;
        }

        //dindex is pivot
        this.NA.map[tindex].next.add(dindex);
        let root = this.NA.map[dindex].prev.first();
        this.NA.map[dindex].prev.delete(root);
        this.NA.map[dindex].prev.add(tindex);
        this.NA.map[dindex].next.delete(tindex);
        this.NA.map[root].next.delete(dindex);
        linked.push(dindex);

        //follow next until, none
        while (this.NA.map[dindex].next.size > 0 && Math.floor(this.NA.map[dindex].next.first() / this.map.width) === terminalLevel) {
            tindex = dindex;
            dindex = this.NA.map[dindex].next.first();
            linked.push(dindex);
            this.NA.map[tindex].next.add(dindex);
            this.NA.map[dindex].prev.add(tindex);
        }

        //drains to terminals & adjust size
        for (let L of linked) {
            this.drains.delete(L);
            this.terminals.add(L);
            this.NA.map[L].size = T_NODE.size;
        }
        return;
    },
    set_node(NODE) {
        let node = NODE.index;
        let ga_value = this.GA.iget_and_mask(node, MAPDICT.WATER);
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
    },
    calc_flow(node, lapsedTime) {
        let NODE = this.NA.map[node];
        this.set_node(NODE);
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
            if (this.GA.icheck(node, MAPDICT.TRAP_DOOR)) return;
            let grid = this.NA.indexToGrid(node).add(UP);
            if (this.GA.isOutOfBounds(grid)) return;
            if (this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL)) return;
            if (this.NA.map[this.NA.gridToIndex(grid)].size > 0) return;

            //terminate if not last that reached flood level
            //and there are terminals lower than flood level

            if (this.terminals.size > 0 && this.any_terminal_lower() && grid.y < this.flood_level) {
                return;
            }

            this.excess_flow += excess_flow;
            return this.next_line(grid, NODE, lapsedTime);
        }

        if (NODE.size <= 0) {
            NODE.size = 0;
            let levelOfPrevious = this.NA.indexToGrid(NODE.prev.first()).y;
            let levelOfThis = Math.floor(NODE.index / this.map.width);

            //
            if (this.flood_level < levelOfThis) {
                this.drains.delete(NODE.index);
                this.terminals.add(NODE.index);
                return;
            } else if (levelOfPrevious < this.impliedLevel && levelOfPrevious > this.NA.indexToGrid(NODE.index).y) {
                if (levelOfPrevious > this.flood_level) {
                    this.flood_level = levelOfPrevious;
                    console.log("* setting flood level from previous", this.flood_level);
                    this.add_drains_from_flood_level();
                }
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
    next_line(grid, NODE, lapsedTime = 17) {
        console.log("NEXT LINE", grid);
        let node = this.GA.gridToIndex(grid);
        let NEW = this.NA.map[node];
        NEW.type = "UP";
        let left = this.find_branch(node, LEFT, "LEFT");
        let right = this.find_branch(node, RIGHT, "RIGHT");
        console.log("..branches", left, right);
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
    find_branch(node, dir, type, dig = true) {
        console.log("find branch", node, dir, type, dig);
        let line = [];
        let grid = this.GA.indexToGrid(node).add(dir);
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
                console.log("PATH DOWN", down_grid, dig);
                //check if flooded
                if (dig) {
                    if (this.NA.map[this.NA.gridToIndex(down_grid)].size === 0) {
                        return this.dig_down(down_grid);
                    }
                } else {
                    return line;
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
        let drawStart = point.add(new Vector(NODE.boundaries.off_x, ENGINE.INI.GRIDPIX - height));
        const pattern = CTX.createPattern(PATTERN.pattern.water.img, "repeat");
        CTX.fillStyle = pattern;
        CTX.fillRect(drawStart.x, drawStart.y, width, height);
    },
    add_drains_from_flood_level() {
        console.log("add_drains_from_flood_level");
        this.NA_to_GA();
        let startIndex = this.flood_level * this.map.width;
        for (let i = startIndex; i < startIndex + this.map.width; i++) {
            if (this.NA.map[i]) {
                if (this.NA.map[i].size === this.NA.map[i].max_flow) {
                    let NM = this.GA.findPath_AStar_fast(this.NA.indexToGrid(i), this.origin, [MAPDICT.WATER]);
                    console.log("path->", i, this.NA.indexToGrid(i), NM);
                    if (NM !== null) {
                        this.drains.add(i);
                    } else {
                        this.flood_link(this.NA.indexToGrid(i));
                        this.NA.map[i].prev = new Set([this.origin_index]);
                        this.NA.map[this.origin_index].next.add(i);
                    }
                }
            }
        }
    },
    flood_link(start, path = [MAPDICT.WATER]) {
        var Q = [start];
        let NodeMap = this.GA.setNodeMap("flood_linkNodeMap", path);
        NodeMap[start.x][start.y] = null;
        var selected;
        while (Q.length > 0) {
            selected = Q.shift();
            let dirs = this.GA.getDirectionsFromNodeMap(selected, NodeMap);
            let selected_index = this.GA.gridToIndex(selected);
            this.NA.map[selected_index].next.clear();
            for (let q = 0; q < dirs.length; q++) {
                let next = selected.add(dirs[q]);
                let next_index = this.GA.gridToIndex(next);
                NodeMap[next.x][next.y] = null;
                Q.push(next);
                this.NA.map[selected_index].next.add(next_index);
                this.NA.map[this.NA.map[next_index].prev.first()].next.delete(next_index);
                this.NA.map[next_index].prev = new Set([selected_index]);
            }
        }
    },
    reFlow(index, which) {
        console.log("\n#############################################");
        console.log("\n#############################################");
        console.log("\n#############################################");
        console.warn("ReFlow", index, which);
        let grid = this.GA.indexToGrid(index);
        let NODE = this.NA.map[index];
        console.log(grid, "grid.y, this.flood_level", grid.y, this.flood_level, "NODE", NODE);
        let nextGrid;
        if (NODE.type) {
            nextGrid = grid.add(eval(NODE.type));
        } else {
            nextGrid = grid;
        }

        let cacheType = NODE.type;
        console.log('cacheType', cacheType);
        let correction = 0;
        if (which === MAPDICT.DOOR) correction = 1;
        let impliedLevel = grid.y + correction;
        this.impliedLevel = impliedLevel; //TBC
        if (this.flood_level < impliedLevel) {
            //reflow
            if (this.terminals.size > 0 && this.drains.size === 0) {
                this.drains.moveFrom(this.terminals);
                console.log("drains from terminals");
            } else {
                this.add_drains_from_flood_level();
                console.log("drains from flood level");
            }
            console.log("drains set", this.drains);
            //this.next_line(grid, this.NA.map[this.origin_index]);
            //this.next_line(nextGrid, this.NA.map[this.origin_index]);
            this.next_line(this.dig_down(nextGrid), this.NA.map[this.origin_index]);
        } else if (this.flood_level === impliedLevel) {
            this.next_line(this.dig_down(grid), this.NA.map[this.origin_index]);
            //this.next_line(this.dig_down(nextGrid), this.NA.map[this.origin_index]);
            console.log("drains dig next line");
        } else {
            console.log("REFLOW Not applicable");
        }

        // update line after reflow
        if (NODE.size > 0) {
            console.log("********************************************");
            console.log("update line after reflow", NODE, "after reflow");
            console.log("********************************************");
            let preNode = this.NA.map[NODE.prev.first()];
            NODE.size = preNode.size;
            NODE.type = "UP";
            this.set_node(NODE);
            if (cacheType) {
                let branch = this.find_branch(index, eval(cacheType), cacheType, false); //?
                let N = index;
                for (let b of branch) {
                    if (this.impliedLevel - 1 === this.flood_level) {
                        this.drains.add(b);
                    }
                    this.NA.map[N].next.add(b);
                    this.NA.map[b].prev.add(N);
                    this.NA.map[b].size = preNode.size;
                    this.set_node(this.NA.map[b]);
                    N = b;
                }
            }
        }
        console.log("\n#############################################\n");
        return;
    },
    NA_to_GA(W = MAPDICT.WATER) {
        for (let index = 0; index < this.NA.map.length; index++) {
            if (this.NA.map[index]) {
                if (this.NA.map[index].size === this.NA.map[index].max_flow) {
                    this.GA.iset(index, W);
                } else {
                    this.GA.iclear(index, W);
                }
            }
        }
    }
};

//END
console.log(`%cFLOW ${FLOW.VERSION} loaded.`, FLOW.CSS);