/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
/*jshint esversion: 11 */
"use strict";

/** 
    FLOW algorithms

    known issues, TODO:
        * double flow to double flowed     
*/
class FlowNode {
    constructor(index) {
        this.index = index;
        this.next = new Set();
        this.prev = new Set();
        this.size = 0;
        this.flow = 0;
        this.type = 'NOWAY';
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
    VERSION: "0.8.4a",
    CSS: "color: #F3A",
    DEBUG: false,
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
            if (this.DEBUG) console.log("* setting flood level from set FL", this.flood_level);
        }
    },
    flow(lapsedTime, flow = FLOW.INI.ORIGIN_FLOW) {
        if (FLOW.DEBUG) {
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
            console.log(",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n");
        }

        if (this.terminals.size > 0 && this.drains.size > 0) {
            for (let T of this.terminals) {
                let terminalLevel = Math.floor(T / this.map.width);
                if (FLOW.DEBUG) {
                    console.log("linking possibility", T, "-> terminal level", terminalLevel, ", flood level:", this.flood_level);
                }
                if (terminalLevel === this.flood_level) {
                    let DrainCandidates = [];
                    if (this.drains.has(T - 1)) {
                        DrainCandidates.push(T - 1);
                    }
                    if (this.drains.has(T + 1)) {
                        DrainCandidates.push(T + 1);
                    }
                    if (DrainCandidates.length > 0) {
                        for (let D of DrainCandidates) {
                            this.link_stream(T, D);
                        }
                    }
                    break;
                }
            }
        }

        if (this.terminals.size === 0) {
            this.NA_to_GA();
            if (FLOW.DEBUG) console.log("Adding terminals?");
            let startIndex = this.flood_level * this.map.width;
            for (let i = startIndex; i < startIndex + this.map.width; i++) {
                if (this.NA.map[i]?.size === 1) {
                    let t = i - this.map.width;
                    if (t > 0 && this.NA.map[t]?.size === 0) {
                        let NM = this.GA.findPath_AStar_fast(this.NA.indexToGrid(i), this.origin, [MAPDICT.WATER]);
                        if (NM !== null) {
                            if (FLOW.DEBUG) console.log("..adding terminal: ", i);
                            this.addTerminal(i);
                        }
                    }
                }
            }
        }

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
            if (FLOW.DEBUG) console.log("drains -> terminals");
            this.terminals = this.drains;
            this.drains = new Set();
        }
        return;
    },
    link_stream(terminal, drain) {
        if (FLOW.DEBUG) console.log('link_stream terminal, drain', terminal, drain);
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
            if (FLOW.DEBUG) console.log("..linking", tindex, "->", dindex);
            this.link_nodes(tindex, dindex);
            this.unlink_nodes(next, dindex);
            tindex = dindex;
            dindex = next;
        }

        //dindex is pivot
        if (FLOW.DEBUG) console.log("..linking", tindex, "->", dindex);
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
            if (FLOW.DEBUG) console.log("..linking", tindex, "->", dindex);
            this.link_nodes(tindex, dindex);
        }

        //drains to terminals & adjust size
        for (let L of linked) {
            this.drains.delete(L);
            this.addTerminal(L);
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
    },
    overflow(node, NODE, lapsedTime) {
        if (NODE.size > NODE.max_flow) {
            let excess_flow = NODE.size - NODE.max_flow;
            NODE.size = NODE.max_flow;
            this.terminals.delete(node);
            if (this.GA.icheck(node, MAPDICT.TRAP_DOOR)) return;
            let grid = this.NA.indexToGrid(node).add(UP);

            if (FLOW.DEBUG) {
                console.log("\nOVERFLOW analysis for node ", NODE, "\n\tup -> ", grid, "\n\twhich is ", this.NA.map[this.NA.gridToIndex(grid)], "\n");
            }

            if (this.GA.isOutOfBounds(grid)) return;
            if (this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL)) return;
            if (this.NA.map[this.NA.gridToIndex(grid)].size > 0) return;
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
            if (FLOW.DEBUG) {
                console.log("\nUNDERFLOW analysis for node ", NODE, ":");
                console.log("\tlevelOfThis:", levelOfThis, "; levelOfPrevious", levelOfPrevious, "flood level:", this.flood_level);
                console.log("\timplied level", this.impliedLevel);
                console.log("\t WTF. this.NA.indexToGrid(NODE.index).y", this.NA.indexToGrid(NODE.index).y, this.NA.indexToGrid(NODE.index).y === levelOfThis);
            }

            if (this.flood_level < levelOfThis) {
                this.drains.delete(NODE.index);
                this.addTerminal(NODE.index);
                if (FLOW.DEBUG) console.log("* flood level adjustment blocked, drain to terminal->", NODE.index);
                return;
            } else if (levelOfPrevious < this.impliedLevel && levelOfPrevious > levelOfThis) {
                if (levelOfPrevious > this.flood_level) {
                    this.flood_level = levelOfPrevious;
                    if (FLOW.DEBUG) console.log("* setting flood level from previous", this.flood_level);
                    this.add_drains_from_flood_level();
                }
                //
            } else if (levelOfPrevious === this.impliedLevel) {
                this.flood_level = levelOfPrevious;
                if (FLOW.DEBUG) {
                    console.log("* setting flood level from previous and stopped draining");
                }
            }

            this.clearNode(NODE);
            return;
        }
    },
    clearNode(NODE) {
        FLOW.NA.map[NODE.prev.first()].next.delete(NODE.index);
        NODE.next.clear();
        NODE.prev.clear();
        FLOW.drains.delete(NODE.index);
    },
    addTerminal(node) {
        if (FLOW.DEBUG) {
            if (this.drains.has(node)) {
                console.error("Adding existing drain to terminal!", node, this.drains);
                throw "Adding existing drain to terminal!";
            }
        }
        this.terminals.add(node);
        this.NA.map[node].size = Math.max(this.NA.map[node].size, FLOW.INI.MIN_SIZE);
    },
    addTerminalArray(arr) {
        for (let node of arr) {
            this.addTerminal(node);
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
        if (FLOW.DEBUG) console.log("NEXT LINE", grid);
        let node = this.GA.gridToIndex(grid);
        let NEW = this.NA.map[node];
        NEW.type = "UP";
        let left = this.find_branch(node, LEFT, "LEFT");
        let right = this.find_branch(node, RIGHT, "RIGHT");
        if (FLOW.DEBUG) console.log("..branches", left, right);
        let candidates;

        if (Array.isArray(left) && Array.isArray(right)) {
            this.set_flood_level(this.NA.indexToGrid(node).y);
            this.safe_unlink_node(node);
            this.link_nodes(NODE.index, node);
            candidates = [node];

            for (let arr of [left, right]) {
                candidates = candidates.concat(arr);
                let N = node;
                for (let element of arr) {
                    this.link_nodes(N, element);
                    if (FLOW.DEBUG) {
                        if (this.NA.map[element].prev.size > 1) {
                            console.error("Node part of cycle ...", element, this.NA.map[element]);
                            throw "Node part of cycle ...";
                        }
                    }
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

        this.addTerminalArray(candidates);
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
        if (FLOW.DEBUG) console.log("find branch", node, dir, type, dig);
        let line = [];
        let grid = this.GA.indexToGrid(node).add(dir);
        let index;
        while (!this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL)) {
            index = this.GA.gridToIndex(grid);

            if (FLOW.DEBUG) console.log("_branch, checking flood: ", index, "->", this.NA.map[index].size);

            if (this.NA.map[index].size > 0) {
                if (FLOW.DEBUG) {
                    console.log(".NODE ", index, "flooded:", this.NA.map[index].size, "terminating branch on", this.NA.map[index]);
                }
                return line;
            }

            if (this.GA.check(grid, MAPDICT.DOOR)) {
                line.push(index);
                this.NA.map[index].type = type;
                return line;
            }
            let down_grid = grid.add(DOWN);

            if (!this.GA.check(down_grid, MAPDICT.WALL + MAPDICT.BLOCKWALL + MAPDICT.TRAP_DOOR)) {
                if (FLOW.DEBUG) console.log(".PATH DOWN", down_grid, dig);
                if (dig) {
                    if (this.NA.map[this.NA.gridToIndex(down_grid)].size === 0) {
                        if (FLOW.DEBUG) console.log("...no flood, diging down", down_grid);
                        return this.dig_down(down_grid);
                    } else {
                        if (FLOW.DEBUG) console.log("..flooded. dig stopped.");
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
        if (FLOW.DEBUG) {
            if (this.NA.map[node].prev.size > 1) {
                console.error(node, this.NA.map[node]);
                throw "Critical FuckUp. Cycled Node!";
            }
        }
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
    isTerminalAbove(i) {
        while (i >= 0) {
            if (this.terminals.has(i)) return true;
            i -= this.map.width;
        }
        return false;
    },
    add_drains_from_flood_level() {
        if (FLOW.DEBUG) console.log("add_drains_from_flood_level");
        this.NA_to_GA();
        let startIndex = this.flood_level * this.map.width;
        for (let i = startIndex; i < startIndex + this.map.width; i++) {
            if (this.NA.map[i]) {
                if (this.NA.map[i].size === this.NA.map[i].max_flow) {
                    let NM = this.GA.findPath_AStar_fast(this.NA.indexToGrid(i), this.origin, [MAPDICT.WATER]);
                    if (NM !== null) {
                        if (!this.isTerminalAbove(i)) {
                            if (FLOW.DEBUG) console.log(".. adding drain: ", i);
                            this.drains.add(i);
                        }
                    } else {
                        this.flood_link(this.NA.indexToGrid(i));
                        this.NA.map[this.NA.map[i].prev.first()].next.delete(i);
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
    drainUp(index) {
        if (FLOW.DEBUG) console.log("drainUp", index, this.NA.indexToGrid(index));
        let upIndex = index - this.map.width;
        let NODE = this.NA.map[upIndex];
        this.NA.map[NODE.prev.first()]?.next.delete(NODE.index);
        while (NODE?.size > 0) {
            if (FLOW.DEBUG) console.log("..draining up NODE", upIndex, this.NA.indexToGrid(upIndex));
            this.drains.delete(upIndex);
            this.terminals.delete(upIndex);
            this.excess_flow += NODE.size;
            NODE.size = 0;
            if (NODE.next.first()) {
                if (Math.floor(NODE.next.first() / this.map.width) === Math.floor(NODE.index / this.map.width)) {
                    this.NA.map[NODE.next.first()].prev.delete(NODE.index);
                    this.NA.map[NODE.next.first()].prev.add(this.origin_index);
                    this.NA.map[this.origin_index].next.add(NODE.next.first());
                }
            }

            NODE.prev.clear();
            NODE.next.clear();
            upIndex -= this.map.width;
            NODE = this.NA.map[upIndex];
        }
    },
    drainsFromTerminals() {
        for (let t of this.terminals) {
            if (Math.floor(t / this.map.width) <= this.flood_level) {
                this.terminals.delete(t);
                this.drains.add(t);
            }
        }
    },
    reFlow(index, which) {
        if (FLOW.DEBUG) {
            console.warn("ReFlow", index, which);
        }
        let grid = this.GA.indexToGrid(index);
        let NODE = this.NA.map[index];
        if (FLOW.DEBUG) console.log(grid, "NODE", NODE);
        if (which === MAPDICT.DOOR && NODE.size === 0) {
            if (FLOW.DEBUG) console.log(".. dry door node, quitting.");
            return;
        }
        let nextGrid;
        let correction = 0;
        let downward = false;
        let upward = false;
        if (which === MAPDICT.DOOR) correction = 1;

        if (NODE.type != "NOWAY") {
            nextGrid = grid.add(eval(NODE.type));
        } else if (which === MAPDICT.BLOCKWALL) {
            nextGrid = grid;
            if (this.NA.map[index + this.map.width]) {
                downward = true;
            } else {
                correction = 1;
            }
            if (this.NA.map[index - this.map.width]?.size > 0) {
                upward = true;
                this.drainUp(index);
            }
        }
        if (FLOW.DEBUG) console.log(grid, "to", nextGrid, "downward", downward, "upward", upward);

        let cacheType = NODE.type;
        if (FLOW.DEBUG) console.log('cacheType', cacheType, eval(cacheType));
        let impliedLevel = grid.y + correction;
        this.impliedLevel = impliedLevel;

        if (FLOW.DEBUG) {
            console.log("Setting drains, FL:", this.flood_level, "IL:", this.impliedLevel);
        }
        if (this.flood_level < impliedLevel) {
            if (this.terminals.size > 0 && this.drains.size === 0) {
                this.drainsFromTerminals();
                if (FLOW.DEBUG) console.log("> drains from terminals", this.drains);
                if (this.drains.size === 0) {
                    this.add_drains_from_flood_level();
                    if (FLOW.DEBUG) console.log(">> nothing from terminals, trying drains from flood level", this.drains);
                }
            } else {
                this.add_drains_from_flood_level();
                if (FLOW.DEBUG) console.log("> drains from flood level");
            }
            if (FLOW.DEBUG) console.log("Drains set.....:", this.drains);
            this.next_line(this.dig_down(nextGrid), this.NA.map[this.origin_index]);
        } else if (this.flood_level === impliedLevel && which !== MAPDICT.BLOCKWALL) {
            if (FLOW.DEBUG) console.log("drains dig next line");
            this.next_line(this.dig_down(grid), this.NA.map[this.origin_index]);
        } else {
            if (FLOW.DEBUG) console.log("REFLOW Not applicable");
            return;
        }

        // update line after reflow, except in theese cases
        if (downward) return;
        if (upward) return;
        if (this.both_flooded(nextGrid)) return;

        if (FLOW.DEBUG) {
            console.log("***********************************************");
            console.log("update line after reflow", NODE, "after reflow");
            console.log("***********************************************");
        }

        let preNode;
        if (NODE.prev.size > 0 && NODE.prev.first() !== this.origin_index) { //this will fail sometimes??
            preNode = NODE.prev.first();
        } else {
            if (FLOW.DEBUG) console.log("Finding previous wet node for", nextGrid);
            [preNode, cacheType] = this.find_prev(nextGrid);
        }
        if (FLOW.DEBUG) console.log("rechecking preNode", preNode);

        NODE.size = this.NA.map[preNode].size;
        NODE.type = "UP";
        this.set_node(NODE);

        let branch = this.find_branch(index, eval(cacheType), cacheType, false);
        if (which === MAPDICT.BLOCKWALL) {
            this.link_nodes(preNode, index);

            if (this.impliedLevel - 1 === this.flood_level) {
                this.drains.add(index);
            }
        }
        if (FLOW.DEBUG) console.log(index, "extending branch", branch);
        let N = index;
        for (let b of branch) {
            if (this.impliedLevel - 1 === this.flood_level) {
                this.drains.add(b);
            }
            this.link_nodes(N, b);
            this.NA.map[b].size = this.NA.map[preNode].size;
            this.set_node(this.NA.map[b]);
            N = b;
        }
        return;
    },
    link_nodes(from, to) {
        this.NA.map[from].next.add(to);
        this.NA.map[to].prev.add(from);
    },
    safe_unlink_node(node) {
        let prev_node = this.NA.map[node].prev.first();
        if (prev_node) {
            this.unlink_nodes(prev_node, node);
        }
    },
    unlink_nodes(from, to) {
        this.NA.map[from].next.delete(to);
        this.NA.map[to].prev.delete(from);
    },
    both_flooded(grid) {
        return (this.NA.map[this.NA.gridToIndex(grid.add(LEFT))].size > 0) && (this.NA.map[this.NA.gridToIndex(grid.add(RIGHT))].size > 0);
    },
    find_prev(grid) {
        if (this.NA.map[this.NA.gridToIndex(grid.add(LEFT))].size > 0) {
            return [this.NA.gridToIndex(grid.add(LEFT)), "RIGHT"];
        } else if (this.NA.map[this.NA.gridToIndex(grid.add(RIGHT))].size > 0) {
            return [this.NA.gridToIndex(grid.add(RIGHT)), "LEFT"];
        } else throw "DRY NODE FUCKUP!";
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