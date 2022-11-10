/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
//Assets for MazEditor
"use strict";
console.log("%cMAP for RUN loaded.", "color: #888");
var MAP = {
    1: {
        data: `
        {"width":"12","height":"12","map":"BB2AEAA2EAA3BAA2BABAA3BB2ABAA3BAEBB3AA3BB2ABAEBB2AA6BB5ABB13ABABABB6Q$BB5ABB2ABB5ABABB2ABB6IBB2ABB15ABB3AA2BB3AA2BB2AA4BA"}
        `,
        start: `{"x":4, "y":9}`,
        dynamite: `{"x":2, "y":9}`,
        flow: `{"x":2, "y":10}`,
        bat: [[`{"x":2, "y":7}`, UP, 2], [`{"x":5, "y":3}`, DOWN, 1], [`{"x":6, "y":9}`, RIGHT, 3], [`{"x":10, "y":7}`, DOWN, 2], [`{"x":4, "y":7}`, RIGHT, 4],
        [`{"x":6, "y":4}`, UP, 1], [`{"x":10, "y":5}`, UP, 3], [`{"x":2, "y":1}`, DOWN, 2]],
        box: [],
    },
    2: {
        data: `
        {"width":"16","height":"16","map":"BB2AA6BEBB4AQBAA2BAA4QAA2BAA2BB3ABB2AQABABABEBAA7BB12IBB7ABABB4ABB7ABB11ABB86ABB14AA2BB2$BB11AA4BB2ABB5AA3BB7AA2BB9AA2BAA3"}
        `,
        start: `{"x":2, "y":10}`,
        dynamite: `{"x":1, "y":10}`,
        flow: `{"x":1, "y":11}`,
        bat: [[`{"x":3, "y":12}`, UP, 1], [`{"x":3, "y":6}`, RIGHT, 2], [`{"x":6, "y":6}`, RIGHT, 3], [`{"x":1, "y":8}`, UP, 2], [`{"x":6, "y":11}`, RIGHT, 1],
        [`{"x":2, "y":6}`, LEFT, 1], [`{"x":12, "y":6}`, RIGHT, 2], [`{"x":14, "y":4}`, DOWN, 2], [`{"x":11, "y":0}`, DOWN, 2], [`{"x":7, "y":4}`, RIGHT, 1],
        [`{"x":12, "y":4}`, LEFT, 2]],
        box: [],
    },
    3: {
        data: `
        {"width":"16","height":"16","map":"BB3ABB3AQAA2BAA3BB2AA2BABB2AA22BAA5BABB30AA3BB12ABB4ABB5ABB2ABB5ABB6QAA2BB11ABB26ABB78$ABB2IBB3QBQA"}
        `,
        start: `{"x":2, "y":7}`,
        dynamite: `{"x":1, "y":7}`,
        flow: `{"x":1, "y":8}`,
        bat: [[`{"x":3, "y":10}`, UP, 1], [`{"x":5, "y":9}`, DOWN, 1], [`{"x":2, "y":12}`, RIGHT, 5], [`{"x":12, "y":11}`, RIGHT, 2], [`{"x":14, "y":10}`, LEFT, 2],
        [`{"x":12, "y":6}`, DOWN, 2]],
        box: [[`{"x":14, "y":8}`]],
    },
    4: {
        data: `
        {"width":"12","height":"12","map":"BB2AA5BABAA3BB2ABAA4BB6AA2BB2AA2BABB2AA2BABB7ABB5ABB3ABB4ABB2ABB2AA2BB2ABB2QBABB5AA3BB4ABB5ABB2ABB10ABB9ABB7ABB5$IABB7"}
        `,
        start: `{"x":7, "y":6}`,
        dynamite: `{"x":5, "y":6}`,
        flow: `{"x":5, "y":7}`,
        bat: [],
        box: [],
    },
    5: {
        data: `
        {"width":"12","height":"12","map":"BB2ABB2AA3BB2AA5BB2ABB6ABB2QAA2BB2AA2BABAEBB7ABB2ABAA2BB2ABB4ABB2ABB2ABB2ABQBABB6AA2BB3ABB5ABB2ABB10ABB9ABB15AB$IABB5ABAB"}
        `,
        start: `{"x":6, "y":6}`,
        dynamite: `{"x":5, "y":6}`,
        flow: `{"x":5, "y":7}`,
        bat: [],
        box: [],
    },
    6: {
        data: `
        {"width":"12","height":"12","map":"BB3ABABB2AA2BAA8BABAA2BABB5AQABB8ABABB2ABB9ABB15AA2BB5IBB21ABABB3AA2BB5ABB5ABB9ABB4$ABB6A"}
        `,
        start: `{"x":6, "y":6}`,
        dynamite: `{"x":5, "y":6}`,
        flow: `{"x":5, "y":7}`,
        bat: [],
        box: [],
    },
    7: {
        data: `
        {"width":"12","height":"12","map":"BB4AA2BAA12BB4AA2BB14ABB13AA2BB11ABB10QBB12AA2BB9ABB30$ABB2IBB8"}
        `,
        start: `{"x":6, "y":6}`,
        dynamite: `{"x":5, "y":6}`,
        flow: `{"x":5, "y":7}`,
        bat: [],
        box: [],
    },
    8: {
        data: `
        {"width":"12","height":"12","map":"BB2AA5BABAA3BB2AA4BABB5ABB2ABAA2BB4AA2BABB7ABB3ABB4ABB4ABB2ABB2ABB2ABB2ABABB6ABABABB3ABB3ABB2ABB15ABB5ABB5ABB15AB$"}
        `,
        start: `{"x":6, "y":6}`,
        dynamite: `{"x":4, "y":6}`,
        flow: `{"x":5, "y":7}`,
        bat: [],
        box: [],
    },
    9: {
        data: `
        {"width":"12","height":"12","map":"BB2AEBAA2BAA5BB2AA3BEBAA2BB3EBB3AA6BB17ABB6QB$BB6ABB2ABB4ABB13IBAA2BB5IBB16AA3BB3AA3BB5ABB7AA2BB3A"}
        `,
        start: `{"x":10, "y":5}`,
        dynamite: `{"x":5, "y":5}`,
        flow: `{"x":5, "y":6}`,
        bat: [],
        box: [],
    },
    10: {
        data: `
        {"width":"12","height":"12","map":"BB2AEBAA2BAA5BB2AA3BEBB3AA2BB4EBB2AA6BB19ABB5ABB3Q$BB6ABB3AA2BB3ABB3ABB8IBAA2BB4IBB12AA2BB3AA3BB5ABB7AA2BB3A"}
        `,
        start: `{"x":10, "y":5}`,
        dynamite: `{"x":5, "y":5}`,
        flow: `{"x":5, "y":6}`,
        bat: [],
        box: [],
    },
    11: {
        data: `
        {"width":"12","height":"12","map":"BB2AEAA2BB2AA3BB2ABAA3BEBB2AA2BB2ABB2EBB2AA6BB4ABB13ABB9Q$BB6ABB4ABB3ABB2ABB2ABB7IBAA2BB4IBB12AA2BB3AA3BB5ABB7AA2BB3A"}
        `,
        start: `{"x":10, "y":5}`,
        dynamite: `{"x":5, "y":5}`,
        flow: `{"x":5, "y":6}`,
        bat: [],
        box: [],
    },
    12: {
        data: `
        {"width":"16","height":"16","map":"BB2AA2BB2AA4BABB3AA2BABB5AA8BB8ABB4IBB2ABB4AQBB8ABB15ABB6ABB10ABB11ABB5ABB2ABB18ABB110$ABB6A"}
        `,
        start: `{"x":5, "y":8}`,
        dynamite: `{"x":1, "y":12}`,
        flow: `{"x":1, "y":13}`,
        bat: [],
        box: [],
    },
    13: {
        data: `
        {"width":"12","height":"12","map":"BB2AA2BABB2AA2BEBAA2BB2ABB3AA3BB3ABB17Q$BB4ABB3ABB2ABABABB5AA2BB10ABB54IABB5ABA"}
        `,
        start: `{"x":2, "y":3}`,
        dynamite: `{"x":5, "y":5}`,
        flow: `{"x":5, "y":6}`,
        bat: [],
        box: [],
    },
    14: {
        data: `
        {"width":"12","height":"12","map":"BB2AA2BABB2AA2BEBAA2BB2ABB3AA3BB3ABB17Q$BB4ABB3ABB2ABABABB5AA2BB10ABB54IABB5ABA"}
        `,
        start: `{"x":2, "y":3}`,
        dynamite: `{"x":5, "y":5}`,
        flow: `{"x":5, "y":6}`,
        bat: [],
        box: [],
    },
};

var SPAWN = {
    spawn(level) {
        this.spawnBats(level);
        this.spawnBox(level);
    },
    spawnBats(level) {
        for (let bat of MAP[level].bat) {
            let start = Grid.toClass(JSON.parse(bat[0]));
            ENEMY_TG.add(new Bat(start, bat[1], bat[2]));
        }
    },
    spawnBox(level) {
        for (let box of MAP[level].box) {
            let grid = Grid.toClass(JSON.parse(box));
            FLOOR_OBJECT.add(new Box(grid));
        }
        console.log("spawning boxes", FLOOR_OBJECT.POOL);
    }
};

var GA_FLOW_MAP = {
    //MIN_FLOW: 2,
    MIN_FLOW: 0,
    0: 64,
    4: 64,
    8: 64 - 11
};