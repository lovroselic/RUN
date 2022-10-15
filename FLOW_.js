/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
/*jshint esversion: 11 */
"use strict";

/** 
    FLOW algorithms

    known issues, TODO:
        *    
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
        this.distance = -1;
        this.mark = false;
        this.used = false;
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
    VERSION: "II.3.1.a",
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
    sizeMap: null,
    GA: null,
    NA: null,
    //flood_level: Infinity,
    init(map, origin) {
        this.map = map;
        this.GA = map.GA;
        this.origin = origin;
        this.origin_index = this.GA.gridToIndex(this.origin);
        this.sizeMap = new Float32Array(this.map.width * this.map.height);
        this.sizeMap[this.origin_index] = FLOW.INI.ORIGIN_SIZE;
        this.make_path();
        //this.NA.G_set(this.origin, 'flow', FLOW.INI.ORIGIN_FLOW);
        console.log(`%cFLOW initialized`, FLOW.CSS, FLOW.NA);
    },
    make_NA() {
        this.NA = new NodeArray(this.GA, FlowNode, [MAPDICT.EMPTY, MAPDICT.TRAP_DOOR, MAPDICT.DOOR]);
        this.map.NA = this.NA;
    },
    make_path() {
        this.make_NA();

        if (FLOW.DEBUG) {
            console.time("PATH");
            console.group("PATH");
            console.log("Starting path:", this.origin);
        }

        let grid = this.origin;
        this.NA.map[this.origin_index].mark = true;
        this.NA.map[this.origin_index].distance = 0;
        this.set_node(this.NA.map[this.origin_index]);
        this.path(grid, 1, [grid.add(UP)]);

        if (FLOW.DEBUG) {
            console.log("Path done");
            console.groupEnd("PATH");
            console.timeEnd("PATH");
        }
    },
    path(grid, distance, candidates) {
        if (FLOW.DEBUG) {
            console.log(".path", "from grid", grid, "distance", distance, "candidates", candidates);
        }

        let node = this.NA.gridToIndex(grid);
        let NODE = this.NA.map[node];

        //immediate termination rules

        if (this.GA.check(grid, MAPDICT.TRAP_DOOR)) return;

        let nextNode, nextGrid, nextCandidates, nextNODE, found;
        for (let next of candidates) {
            [found, nextGrid, nextCandidates] = this.find_next(next, distance);
            if (found) {
                nextNode = this.NA.gridToIndex(nextGrid);
                nextNODE = this.NA.map[nextNode];
                this.link_nodes(node, nextNode);

                if (FLOW.DEBUG) {
                    console.log("..continue recursion from ", nextGrid);
                }
                this.path(nextGrid, distance + 1, nextCandidates);
            } else if (nextCandidates === null) {
                if (FLOW.DEBUG) console.log("..dead end.");
            } else {
                if (FLOW.DEBUG) {
                    console.log("..path retried..with", nextCandidates);
                }
                this.path(grid, distance, nextCandidates);
            }
        }

        if (FLOW.DEBUG) {
            console.log(".path branch concluded, no more candidates to continue");
        }
    },
    find_next(origin, distance) {
        if (FLOW.DEBUG) {
            console.log(".... finding next from:", origin);
        }
        if (this.NA.map[this.NA.gridToIndex(origin)].mark) {
            if (FLOW.DEBUG) console.log(".... already marked: ", origin);
            return [false, null, null];
        }
        this.NA.map[this.NA.gridToIndex(origin)].used = true;
        origin = this.dig_down(origin);
        let candidates, found;
        [found, candidates] = this.next_line(origin);
        if (!found) {
            if (FLOW.DEBUG) {
                console.log("....deeper sources returned:", candidates);
                return [false, null, candidates];
            }
        } else {
            if (FLOW.DEBUG) {
                console.log("...line returned:", candidates);
            }

            let nextCandidates = [];
            for (let c of candidates) {
                let index = this.NA.gridToIndex(c);
                this.NA.map[index].distance = distance;
                let up = c.add(UP);
                if (this.freeUp(up)) {
                    nextCandidates.push(up);
                }
            }

            return [true, origin, nextCandidates];
        }
    },
    link_nodes(from, to) {
        this.NA.map[from].next.add(to);
        this.NA.map[to].prev.add(from);
        if (FLOW.DEBUG) {
            console.log("linked", from, "->", to);
            if (this.NA.map[to].prev.size > 1) {
                console.error("cycling");
                throw "CYCLE!";
            }
        }
    },
    dig_down(grid) {
        let next_down = grid.add(DOWN);
        while (this.freeDown(next_down)) {
            grid = next_down;
            this.NA.map[this.NA.gridToIndex(grid)].used = true;
            if (FLOW.DEBUG) console.log(".....digging", grid);
            next_down = grid.add(DOWN);
        }
        return grid;
    },
    freeUp(grid) {
        if (this.GA.isOutOfBounds(grid)) return false;
        if (this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL)) return false;
        if (this.NA.map[this.NA.gridToIndex(grid)].mark) return false;
        return true;
    },
    freeDown(grid) {
        if (this.GA.isOutOfBounds(grid)) return false;
        if (this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL + MAPDICT.TRAP_DOOR)) return false;
        if (this.NA.map[this.NA.gridToIndex(grid)].mark) return false;
        if (this.NA.map[this.NA.gridToIndex(grid)].used) return false;
        return true;
    },
    freeLateral(grid) {
        if (this.GA.isOutOfBounds(grid)) return false;
        if (this.GA.check(grid, MAPDICT.WALL + MAPDICT.BLOCKWALL)) return false;
        if (this.NA.map[this.NA.gridToIndex(grid)].mark) return false;
        return true;
    },
    next_line(grid) {
        if (FLOW.DEBUG) console.log(".....NEXT LINE", grid);
        let node = this.GA.gridToIndex(grid);
        let NODE = this.NA.map[node];
        NODE.type = "UP";

        let left = this.find_branch(grid, LEFT, "LEFT");
        if (FLOW.DEBUG) console.log(".......left:", left);
        let right = this.find_branch(grid, RIGHT, "RIGHT");
        if (FLOW.DEBUG) console.log(".......right:", right);

        let candidates;
        if (Array.isArray(left) && Array.isArray(right)) {
            candidates = [node];
            for (let arr of [left, right]) {
                candidates = candidates.concat(arr);
                let N = node;
                for (let element of arr) {
                    this.link_nodes(N, element);
                    N = element;
                }
            }

        } else {
            let new_grids = [];
            if (!Array.isArray(left)) {
                new_grids.push(left);
            }
            if (!Array.isArray(right)) {
                new_grids.push(right);
            }
            if (FLOW.DEBUG) console.log("......deeper sources found", new_grids);
            return [false, new_grids];
        }
        if (FLOW.DEBUG) console.log(".....candidates ready to return:", candidates);
        let candidateGrids = [];
        for (let c of candidates) {
            if (FLOW.DEBUG) {
                if (this.NA.map[c].mark) {
                    console.error("marking already marked!", c, this.NA.indexToGrid(c));
                    throw "marking marked";
                }
                console.log("** marking", c, this.NA.indexToGrid(c));
                this.NA.map[c].mark = true;
            }
            candidateGrids.push(this.NA.indexToGrid(c));
        }
        return [true, candidateGrids];
    },
    find_branch(grid, dir, type) {
        if (FLOW.DEBUG) console.log(".....find branch");
        let line = [];
        grid = grid.add(dir);
        let index;
        while (this.freeLateral(grid)) {
            index = this.GA.gridToIndex(grid);
            if (this.GA.check(grid, MAPDICT.DOOR)) {
                line.push(index);
                this.set_node(this.NA.map[index], type);
                return line;
            }
            if (this.freeDown(grid.add(DOWN))) {
                if (FLOW.DEBUG) console.log("......PATH DOWN", grid.add(DOWN));
                return this.dig_down(grid);
            }
            line.push(index);
            this.set_node(this.NA.map[index], "UP");
            grid = grid.add(dir);
        }
        return line;
    },
    set_node(NODE, type = 'UP') {
        NODE.type = type;
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
    flow(lapsedTime, flow = FLOW.INI.ORIGIN_FLOW) {

    },
    reflow(grid, which) {
        if (FLOW.DEBUG) {
            console.warn("ReFlow:", grid, which);
        }
        this.make_path();
    },

    draw() {
        ENGINE.clearLayer(this.layer);
        this.next_node(this.origin_index);
    },
    next_node(node) {
        let NODE = this.NA.map[node];
        NODE.size = this.sizeMap[node];
        if (NODE.size === 0) return;
        this.draw_node(node);
        if (FLOW.PAINT_DISTANCES) this.mark_node(node);
        for (let n of this.NA.map[node].next) {
            this.next_node(n);
        }
    },
    mark_node(node) {
        let NODE = this.NA.map[node];
        let layer = "flood";
        let point = GRID.gridToCoord(this.GA.indexToGrid(node));
        point.toViewport();
        GRID.paintText(point, NODE.distance, layer);
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
};

//END
console.log(`%cFLOW ${FLOW.VERSION} loaded.`, FLOW.CSS);