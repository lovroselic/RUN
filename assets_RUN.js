/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
//Assets for MazEditor
"use strict";
console.log("%cAssets for MazeEditor ready.", "color: orange");

var LoadTextures = ["BrickWall4.jpg", "RockFloor.jpg"];
var LoadSprites = [];
var LoadSequences = [];
var LoadSheetSequences = [];
var LoadSheets = [];
var ExtendSheetTag = [];
var LoadPacks = [
    { srcName: "hero_walking2.png", count: 6, name: "Hero_walking", dimension: 2 },
    { srcName: "hero fly2.png", count: 6, name: "Hero_flying", dimension: 2 },
    { srcName: "hero idle.png", count: 1, name: "Hero_idle", dimension: 2 },
];
var LoadRotated = [];
var LoadExtWasm = [];
var LoadAudio = [];
var LoadFonts = [];
var LoadRotatedSheetSequences = [];
var LoadSheetSequences = [
    { srcName: "BrownWall.png", count: 12, name: "WallTile", trim: false },
    { srcName: "BlackWall.png", count: 2, name: "BackgroundTile", trim: false },
    { srcName: "d3.png", count: 6, name: "D3", trim: false },
    { srcName: "VertiWall.png", count: 1, name: "VerticalWall", trim: false },
    { srcName: "HoriWall.png", count: 1, name: "HorizontalWall", trim: true },
];
