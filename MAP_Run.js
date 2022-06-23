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
        {"width":"12","height":"12","map":"BB2AEAA2EAA2BABAA4BAA4BB2AA3BAEBB2AA3BB2AEBB2AA6BB17AA2BABB4QB$BB4ABABB4ABB12ABB19ABB4AA3BB9IABB2AA4BA"}
        `,
        start: `{"x":4, "y":9}`,
        bat: [[`{"x":2, "y":7}`, UP, 2], [`{"x":5, "y":3}`, DOWN, 1],]
    },
    2: {
        data: `{"width":"16","height":"16",
        "map":"BB2ABAA3BABAA4BAA6EAA14BAA4EBAA12BAA3BAA4BB2ABAA2BB3AA2BB3ABABB3AA2BAA5BAA2BB7ABB13AA2BB14AIBB9AA2BB4ABB4ABB3ABB12ABB2AA2BB14ABB6AA4BB15ABB3AA2BB17ABABB6AB$ABB2AA2B"}`,
        start: `{"x":9, "y":10}`,
    },
};

var SPAWN = {
    spawn(level){
        this.spawnBats(level);
    },
    spawnBats(level){
        console.log("spwaning bats");
        for (let bat of MAP[level].bat){
            let start = Grid.toClass(JSON.parse(bat[0])); 
            //console.log("bat start", start, "dir", bat[1], "dist", bat[2]);
            let bat_ = new Bat(start, bat[1], bat[2]);
            console.log("bat", bat_);
            ENEMY_TG.add(bat_);
        }
    }
};