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
        [`{"x":6, "y":4}`, UP, 1], [`{"x":10, "y":5}`, UP, 3], [`{"x":2, "y":1}`, DOWN, 2]]
    },
    2: {
        data: `
        {"width":"16","height":"16","map":"BB3ABB3QAA4BAA2BABB2QAA4BAA4BB31ABB7IBB54ABB8ABB7ABB4AA2BB3ABB2ABB14ABB74$ABB10AA2"}
        `,
        start: `{"x":2, "y":10}`,
        dynamite: `{"x":1, "y":10}`,
        flow: `{"x":1, "y":11}`,
        bat: [],
    },
    3: {
        data: `
        {"width":"16","height":"16","map":"BB5AA2BB4AA6BAQAA3QBAA9BB21ABB19IBB49ABB3ABB9AA2BB6AA2BB2ABB16ABB74$ABB10AA2"}
        `,
        start: `{"x":3, "y":10}`,
        dynamite: `{"x":1, "y":10}`,
        flow: `{"x":1, "y":11}`,
        bat: [],
    },
    4: {
        data: `
        {"width":"12","height":"12","map":"BB2AA5BABAA3BB2ABAA4BB6AA2BB2AA2BABB2AA2BABB7ABB5ABB3ABB4ABB2ABB2AA2BB2ABB2QBABB5AA3BB4ABB5ABB2ABB10ABB9ABB7ABB5$IABB7"}
        `,
        start: `{"x":7, "y":6}`,
        dynamite: `{"x":5, "y":6}`,
        flow: `{"x":5, "y":7}`,
        bat: [],
    },
    5: {
        data: `
        {"width":"12","height":"12","map":"BB3AA4BB2AA3BAA2EAA3BABB5AA3BB9ABB6ABB22ABB2IBB3ABB7ABB4AA2BB17AA2BB2ABB24$ABB5AB"}
        `,
        start: `{"x":6, "y":6}`,
        dynamite: `{"x":4, "y":6}`,
        flow: `{"x":4, "y":7}`,
        bat: [],
    },
    6: {
        data: `
        {"width":"12","height":"12","map":"BB3AA2BAA3BB2EAA4BAA4BAA3BAA2BB8ABABB5ABB2ABB5ABB6AA3BB8ABB14ABB2ABB3IBB11AA2BB4AA2BB17AA2BB2ABB5$ABAB"}
        `,
        start: `{"x":6, "y":6}`,
        dynamite: `{"x":4, "y":6}`,
        flow: `{"x":4, "y":7}`,
        bat: [],
    },
    7: {
        data: `
        {"width":"12","height":"12","map":"BB3AA2BAA3BB2EAA4BAA4BB2ABAA2BB2AA2BB7ABABB5ABB3AA3BB4ABB6AA3BB3ABB4ABB13AA2BB4IBB10ABB4AA2BB17AA2BB2ABB5$ABAB"}
        `,
        start: `{"x":6, "y":6}`,
        dynamite: `{"x":4, "y":6}`,
        flow: `{"x":4, "y":7}`,
        bat: [],
    },
    8: {
        data: `
        {"width":"12","height":"12","map":"BEAA3BABAA4BB5ABB62IBB51$ABB9AB"}
        `,
        start: `{"x":3, "y":7}`,
        dynamite: `{"x":1, "y":8}`,
        flow: `{"x":1, "y":9}`,
        bat: [],
    },
    9: {
        data: `
        {"width":"12","height":"12","map":"BB2AEBAA2BAA5BB2AA3BEBAA2BB3EBB3AA6BB17ABB6QB$BB6ABB2ABB4ABB13IBAA2BB5IBB16AA3BB3AA3BB5ABB7AA2BB3A"}
        `,
        start: `{"x":10, "y":5}`,
        dynamite: `{"x":5, "y":5}`,
        flow: `{"x":5, "y":6}`,
        bat: [],
    },
    10: {
        data: `
        {"width":"12","height":"12","map":"BB2AEBAA2BAA5BB2AA3BEBB3AA2BB4EBB2AA6BB19ABB5ABB3Q$BB6ABB3AA2BB3ABB3ABB8IBAA2BB4IBB12AA2BB3AA3BB5ABB7AA2BB3A"}
        `,
        start: `{"x":10, "y":5}`,
        dynamite: `{"x":5, "y":5}`,
        flow: `{"x":5, "y":6}`,
        bat: [],
    },
    11: {
        data: `
        {"width":"12","height":"12","map":"BB2AEAA2EAA2BABAA4BAA4BB2AA3BAEBB2AA3BB2AEBB3AA6BB18AA2BABB4QB$BB5ABABB5ABB11IBB2ABB19ABB4AA3BB3AA2BB2AA4BA"}
        `,
        start: `{"x":6, "y":5}`,
        dynamite: `{"x":2, "y":9}`,
        flow: `{"x":2, "y":10}`,
        bat: [[`{"x":2, "y":7}`, UP, 2], [`{"x":5, "y":3}`, DOWN, 1], [`{"x":6, "y":9}`, RIGHT, 3], [`{"x":10, "y":7}`, DOWN, 2], [`{"x":4, "y":7}`, RIGHT, 4],
        [`{"x":6, "y":4}`, UP, 1], [`{"x":10, "y":5}`, UP, 3], [`{"x":2, "y":1}`, DOWN, 2]]
    },
    12: {
        data: `
        {"width":"12","height":"12","map":"BB2AA2BABB2AA2BEBAA2BB2ABB3AA3BB3ABB17Q$BB4ABB3ABB2ABABABB5AA2BB10ABB54IABB5ABA"}
        `,
        start: `{"x":8, "y":1}`,
        dynamite: `{"x":5, "y":5}`,
        flow: `{"x":5, "y":6}`,
        bat: []
    },
    13: {
        data: `
        {"width":"12","height":"12","map":"BB2AA2BABB2AA2BEBAA2BB2ABB3AA3BB3ABB17Q$BB4ABB3ABB2ABABABB5AA2BB10ABB54IABB5ABA"}
        `,
        start: `{"x":2, "y":3}`,
        dynamite: `{"x":5, "y":5}`,
        flow: `{"x":5, "y":6}`,
        bat: []
    },
    14: {
        data: `
        {"width":"12","height":"12","map":"BB2AA2BABB2AA2BEBAA2BB2ABB3AA3BB3ABB17Q$BB4ABB3ABB2ABABABB5AA2BB10ABB54IABB5ABA"}
        `,
        start: `{"x":2, "y":3}`,
        dynamite: `{"x":5, "y":5}`,
        flow: `{"x":5, "y":6}`,
        bat: []
    },
};

var SPAWN = {
    spawn(level) {
        this.spawnBats(level);
    },
    spawnBats(level) {
        console.log("spawning bats");
        for (let bat of MAP[level].bat) {
            let start = Grid.toClass(JSON.parse(bat[0]));
            ENEMY_TG.add(new Bat(start, bat[1], bat[2]));
        }
    }
};

var GA_FLOW_MAP = {
    MIN_FLOW: 2,
    0: 64,
    4: 64,
    8: 64 - 11
};