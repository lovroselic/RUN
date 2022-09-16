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
        {"width":"12","height":"12","map":"BB2AEAA2EAA2BABAA4BAA4BB2AA3BAEBB2AA3BB2AEBB3AA6BB18AA2BABB4QB$BB5ABABB5ABB11IBB2ABB19ABB4AA3BB3AA2BB2AA4BA"}
        `,
        start: `{"x":4, "y":9}`,
        dynamite: `{"x":2, "y":9}`,
        flow: `{"x":2, "y":10}`,
        bat: [[`{"x":2, "y":7}`, UP, 2], [`{"x":5, "y":3}`, DOWN, 1], [`{"x":6, "y":9}`, RIGHT, 3], [`{"x":10, "y":7}`, DOWN, 2], [`{"x":4, "y":7}`, RIGHT, 4],
        [`{"x":6, "y":4}`, UP, 1], [`{"x":10, "y":5}`, UP, 3], [`{"x":2, "y":1}`, DOWN, 2]]
    },
    2: {
        data: `
        {"width":"12","height":"12","map":"BB2AA8BB2ABB25ABB3ABABB10AIBB28ABB18AA3BABB20ABB10$ABB3"}
        `,
        start: `{"x":7, "y":6}`,
        dynamite: `{"x":5, "y":6}`,
        flow: `{"x":5, "y":7}`,
        bat: [],
    },
    3: {
        data: `
        {"width":"12","height":"12","map":"BB2AA5BABAA3BB2ABAA4BB6AA2BB3AA2BABB2AA2BABB7ABB5ABB4ABB4ABB2ABB2AA2BB2ABB3ABABB5AA3BB5ABB2IBB3ABB2ABB10ABB9ABB7ABB5$ABB3"}
        `,
        start: `{"x":7, "y":6}`,
        dynamite: `{"x":5, "y":6}`,
        flow: `{"x":5, "y":7}`,
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