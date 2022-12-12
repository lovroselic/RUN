/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
//Assets for MazEditor
"use strict";
console.log("%cAssets for MazeEditor ready.", "color: orange");

const LoadTextures = ["BrickWall4.jpg", "RockFloor.jpg"];
const LoadSprites = [];
const LoadSequences = [];
const LoadSheets = [];
const ExtendSheetTag = [];
const LoadPacks = [];
const LoadRotated = [];
const LoadExtWasm = [];
const LoadAudio = [];
const LoadFonts = [];
const LoadRotatedSheetSequences = [];
const LoadSheetSequences = [
    { srcName: "BrownWall64.png", count: 12, name: "WallTile", trim: false },
    { srcName: "BlackWall64.png", count: 2, name: "BackgroundTile", trim: false },
    { srcName: "d3-64.png", count: 6, name: "D3", trim: false },
    { srcName: "VertiWall64.png", count: 1, name: "VerticalWall", trim: false },
    { srcName: "HoriWall64.png", count: 1, name: "HorizontalWall", trim: true },
    { srcName: "BlockWall64.png", count: 1, name: "BlockWall", trim: false },
];
