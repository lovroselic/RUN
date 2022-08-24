/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

/*
    FLOW algorithms
*/
class FlowNode {
    constructor() {
        this.next = new Set();
        this.prev = new Set();
        this.size = 0;
        this.flow = 0;
        this.type = null;
        this.boundaries = null;
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
        ORIGIN_FLOW: 32,
    },
    map: null,
    GA: null,
    NA: null,
    init(map, origin) {
        this.map = map;
        this.GA = map.GA;
        this.make_NA();
        this.origin = origin;
        this.origin_index = this.GA.gridToIndex(this.origin);
        this.terminals = [this.origin_index];
        this.NA.G_set(this.origin, 'size', FLOW.INI.ORIGIN_SIZE);
        this.NA.G_set(this.origin, 'flow', FLOW.INI.ORIGIN_FLOW);
        this.NA.G_set(this.origin, 'type', 'UP');

        console.log(`%cFLOW initialized`, FLOW.CSS, FLOW.NA);
    },
    make_NA() {
        this.NA = new NodeArray(this.GA, FlowNode, [MAPDICT.EMPTY, MAPDICT.TRAP_DOOR, MAPDICT.DOOR]);
        this.map.NA = this.NA;
    },
    flow(lapsedTime) {
        console.log("flow", lapsedTime);
        for (let n of this.terminals) {
            this.calc_flow(n, lapsedTime);
        }
    },
    calc_flow(node, lapsedTime) {
        console.log("calc_flow", node, lapsedTime);
        let ga_value = this.GA.map[node];
        let max_h = GA_FLOW_MAP[ga_value];
        let min_h = GA_FLOW_MAP.MIN_FLOW;
        console.log('..max-min h', min_h, max_h);
        let min_w, max_w, off_x;

        switch (this.NA.map[node].type) {
            case ('UP'):
                min_w = 0;
                max_w = ENGINE.INI.GRIDPIX;
                off_x = 0;
                break;
            default:
                console.error("node type error", this.NA.map[node]);
                break;
        }
        console.log("..max-min w", min_w, max_w);
        this.NA.map[node].boundaries = new Boundaries(min_w, max_w, min_h, max_h, off_x);

        let max_flow = max_w * max_h / (ENGINE.INI.GRIDPIX ** 2);
        console.log('..max_flow', max_flow);

        //update flow!
        //cont
    },
    draw() {
        this.next_node(this.origin_index);
    },
    next_node(node) {
        console.log("next", node);
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