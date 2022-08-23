/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

/*
    FLOW algorithms
*/
class FlowNode {
    constructor(ga_val) {
        this.next = new Set();
        this.prev = new Set();
        this.size = 0;
        this.flow = 0;
        this.ga_val = ga_val;
    }
}
var FLOW = {
    VERSION: "0.01",
    CSS: "color: #F3A",
    INI: {
        ORIGIN_SIZE: 0.2,
        ORIGIN_FLOW: 32,
        ALPHA: 0.4,
    },
    map: null,
    GA: null,
    init(map, origin) {
        this.map = map;
        this.GA = map.GA;
        this.update_NA();
        this.origin = origin;
        this.origin_index = this.GA.gridToIndex(this.origin);
        this.NA.G_set(this.origin, 'size', FLOW.INI.ORIGIN_SIZE);
        this.NA.G_set(this.origin, 'flow', FLOW.INI.ORIGIN_FLOW);


        console.log(`%cFLOW initialized`, FLOW.CSS, FLOW.NA);
    },
    update_NA() {
        this.NA = new NodeArray(this.GA, FlowNode, [MAPDICT.EMPTY, MAPDICT.TRAP_DOOR, MAPDICT.DOOR]);
        this.map.NA = this.NA;
    },
    flow(lapsedTime) {
        this.update_NA();
    },
    draw() { }
};

//END
console.log(`%cFLOW ${FLOW.VERSION} loaded.`, FLOW.CSS);