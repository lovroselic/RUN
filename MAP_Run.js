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
        snake: [],
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
        snake: [],
    },
    3: {
        data: `
        {"width":"16","height":"16","map":"BB5AQABAA3BB2ABABB2AA7QAA6BB3ABAA7BAA4BAA2BABABAA2BB41AA3BB18ABB4ABB11ABB2ABB11ABB12QBB4ABB2$ABB25ABB21AA2BABB3AA3BB9AA2BB2IBB3QQ2BQAA2"}
        `,
        start: `{"x":2, "y":7}`,
        dynamite: `{"x":1, "y":7}`,
        flow: `{"x":1, "y":8}`,
        bat: [[`{"x":3, "y":10}`, UP, 1], [`{"x":5, "y":9}`, DOWN, 1], [`{"x":2, "y":12}`, RIGHT, 5], [`{"x":12, "y":11}`, RIGHT, 2], [`{"x":14, "y":10}`, LEFT, 2],
        [`{"x":12, "y":6}`, DOWN, 2]],
        box: [[`{"x":14, "y":8}`]],
        snake: [[`{"x":7, "y":5}`, "LEFT"], [`{"x":8, "y":4}`, "RIGHT"], [`{"x":7, "y":1}`, "LEFT"],],
    },
    4: {
        data: `
        {"width":"16","height":"16","map":"BQABB5AA7BAQAA5BABB3AA2BABB2AA3BB8ABB2ABB3ABB2AA3BAA2BAA4BAA2BB9ABB13AA2BQABB3AA2BB6AA3BB4ABB6IABB4ABB2AA2QABB3$BB11ABB14AA2QBB49AA5BAA2BB4ABB6ABABB8AQQ2BB2QQ3BA"}
        `,
        start: `{"x":2, "y":12}`,
        dynamite: `{"x":1, "y":13}`,
        flow: `{"x":1, "y":14}`,
        bat: [[`{"x":2, "y":7}`, RIGHT, 1], [`{"x":9, "y":7}`, RIGHT, 5], [`{"x":14, "y":4}`, DOWN, 3]],
        box: [[`{"x":12, "y":10}`]],
        snake: [[`{"x":1, "y":10}`, "LEFT"], [`{"x":1, "y":8}`, "RIGHT"], [`{"x":4, "y":9}`, "LEFT"], [`{"x":6, "y":8}`, "RIGHT"],
        [`{"x":13, "y":9}`, "LEFT"], [`{"x":5, "y":3}`, "LEFT"], [`{"x":4, "y":1}`, "RIGHT"],],
    },
    5: {
        data: `
        {"width":"16","height":"32","map":"BB2AEABABB8QAA11BABAA14BB2AA2BABAA10BB9ABB2ABB3ABB4ABAA2BB7AA2BB4AA7BB3AA2BB19ABB10ABB3AA5BB7ABABB2$BB2ABB44ABB10AA3BB2AA4BB9AA4BB3ABB5ABB10ABB2ABB22ABB4AA4BB6ABB11AA2BB2AA2BB3ABB9QBABB2IBB10ABB25AA7BB7ABB6AA2BB100AA2BB5AA2BQBA"}
        `,
        start: `{"x":2, "y":13}`,
        dynamite: `{"x":1, "y":14}`,
        flow: `{"x":1, "y":15}`,
        bat: [[`{"x":1, "y":7}`, UP, 2], [`{"x":1, "y":1}`, DOWN, 3], [`{"x":6, "y":1}`, RIGHT, 4], [`{"x":12, "y":3}`, LEFT, 4], [`{"x":9, "y":9}`, LEFT, 2],
        [`{"x":11, "y":9}`, RIGHT, 2], [`{"x":10, "y":9}`, DOWN, 2], [`{"x":9, "y":14}`, DOWN, 2], [`{"x":7, "y":17}`, RIGHT, 4], [`{"x":11, "y":18}`, LEFT, 4],
        [`{"x":4, "y":11}`, RIGHT, 3], [`{"x":7, "y":11}`, DOWN, 3]],
        box: [[`{"x":10, "y":14}`]],
        snake: [[`{"x":1, "y":8}`, "LEFT"], [`{"x":1, "y":4}`, "RIGHT"], [`{"x":10, "y":2}`, "RIGHT"], [`{"x":7, "y":5}`, "LEFT"], [`{"x":7, "y":7}`, "LEFT"],
        [`{"x":3, "y":6}`, "LEFT"], [`{"x":13, "y":7}`, "RIGHT"], [`{"x":13, "y":6}`, "LEFT"]],
    },
    6: {
        data: `
        {"width":"24","height":"24","map":"BB2AA16BAA3BQBQBB4ABB4QAA2QBB3AA4BQBAQQ2AA4BAA3QQ3AA2BAA3BB2AA2BB2AQBB3AA3BB2AA4BB8ABB5AA3BAA2BAA2BB21AA2BB12ABABB6ABABB2AA6BAA2BB2ABB2AA2BB21ABB48ABB16ABB5ABB2ABB2AA2BABB15ABB2ABABB2ABB6ABB3ABB11ABB7AA2BB3AA3BB5ABB3ABAA2BAA3BAA2BABB7ABB6ABB4ABB3ABABABB2ABB6ABAA5BB2AA2BB3ABB3AA3BAA3BAA7BB4AA2BB2AA9BB2AA2BB5ABABABB4AA2BB6AA4BB6ABB2$BB15ABB2ABB2ABB22ABB11IABB13AA2QQ3AA6QAA3"}
        `,
        start: `{"x":13, "y":19}`,
        dynamite: `{"x":12, "y":21}`,
        flow: `{"x":12, "y":22}`,
        bat: [[`{"x":1, "y":21}`, UP, 5], [`{"x":5, "y":17}`, RIGHT, 2], [`{"x":2, "y":13}`, DOWN, 2], [`{"x":1, "y":7}`, RIGHT, 2], [`{"x":5, "y":4}`, DOWN, 3],
        [`{"x":1, "y":2}`, DOWN, 3], [`{"x":6, "y":21}`, UP, 3], [`{"x":17, "y":21}`, UP, 4], [`{"x":22, "y":15}`, DOWN, 6], [`{"x":11, "y":19}`, RIGHT, 1],
        [`{"x":13, "y":15}`, LEFT, 2], [`{"x":18, "y":17}`, LEFT, 2], [`{"x":16, "y":14}`, UP, 6], [`{"x":4, "y":12}`, RIGHT, 4], [`{"x":8, "y":4}`, DOWN, 2],
        [`{"x":7, "y":6}`, DOWN, 3], [`{"x":13, "y":11}`, LEFT, 2], [`{"x":11, "y":8}`, RIGHT, 2], [`{"x":20, "y":11}`, RIGHT, 2], [`{"x":21, "y":1}`, DOWN, 9],
        [`{"x":15, "y":4}`, RIGHT, 2]],
        box: [[`{"x":18, "y":6}`], [`{"x":22, "y":1}`]],
        snake: [[`{"x":2, "y":14}`, "LEFT"], [`{"x":2, "y":8}`, "RIGHT"], [`{"x":7, "y":1}`, "RIGHT"], [`{"x":12, "y":12}`, "LEFT"], [`{"x":16, "y":15}`, "RIGHT"],
        [`{"x":22, "y":15}`, "RIGHT"], [`{"x":21, "y":13}`, "LEFT"], [`{"x":21, "y":6}`, "RIGHT"], [`{"x":12, "y":4}`, "RIGHT"], [`{"x":17, "y":7}`, "LEFT"]],
    },
    7: {
        data: `
        {"width":"24","height":"24","map":"BB4AA2EABABB3AA3BB2AA2BB4ABB2AA4QAA16BB2ABABAA2BB9ABB20ABB2EBABB4AA2BB2ABB6AA5BB2ABB4AA2BB8AA2BAA3BB2QBB15ABB3ABB13QBB31ABB4QAA2BB3AA6QBABB4AA4BB3AA4BAA6BB3QBB6ABB2AA2QAA3BB2QQ2BB14ABB5ABB3ABAA2BB5AA2BABB4ABABB11ABB69$BB12ABB6ABB19ABB53ABB6AQQ2AA2BAA2BB5ABB2IABB19AA2BB2ABAA2BB3AA3BB2AA2BB2QBB10AA2BB4ABB8"}
        `,
        //start: `{"x":22, "y":1}`,
        start: `{"x":10, "y":3}`,
        dynamite: `{"x":21, "y":21}`,
        flow: `{"x":21, "y":22}`,
        bat: [[`{"x":20, "y":10}`, RIGHT, 2], [`{"x":22, "y":16}`, LEFT, 2], [`{"x":14, "y":1}`, RIGHT, 4], [`{"x":16, "y":6}`, LEFT, 2], [`{"x":14, "y":11}`, RIGHT, 2],
        [`{"x":12, "y":11}`, DOWN, 2], [`{"x":12, "y":5}`, LEFT, 4], [`{"x":8, "y":12}`, LEFT, 4], [`{"x":3, "y":10}`, LEFT, 2], [`{"x":1, "y":10}`, UP, 2],
        [`{"x":3, "y":9}`, UP, 3], [`{"x":1, "y":6}`, RIGHT, 1], [`{"x":2, "y":7}`, LEFT, 1], [`{"x":2, "y":9}`, UP, 1], [`{"x":4, "y":3}`, RIGHT, 4]],
        box: [[`{"x":20, "y":1}`], [`{"x":7, "y":5}`], [`{"x":3, "y":12}`],],
        snake: [[`{"x":21, "y":4}`, "LEFT"], [`{"x":21, "y":13}`, "RIGHT"], [`{"x":18, "y":15}`, "LEFT"], [`{"x":18, "y":5}`, "RIGHT"], [`{"x":15, "y":2}`, "LEFT"],
        [`{"x":15, "y":10}`, "RIGHT"], [`{"x":18, "y":11}`, "LEFT"], [`{"x":4, "y":8}`, "RIGHT"], [`{"x":10, "y":1}`, "LEFT"], [`{"x":10, "y":2}`, "RIGHT"],
        [`{"x":2, "y":4}`, "LEFT"]],
    },
};

var SPAWN = {
    spawn(level) {
        this.spawnBats(level);
        this.spawnBox(level);
        this.spawnSnakes(level);
    },
    spawnSnakes(level) {
        for (let snake of MAP[level].snake) {
            let grid = Grid.toClass(JSON.parse(snake[0]));
            ENEMY_TG.add(new Snake(grid, snake[1]));
        }
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
    }
};

const GA_FLOW_MAP = {
    MIN_FLOW: 0,
    0: 64,
    4: 64,
    8: 64 - 11
};