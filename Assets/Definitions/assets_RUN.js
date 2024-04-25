/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
//Assets for RUN
"use strict";
console.log("%cAssets for RUN ready.", "color: orange");

LoadTextures = [
    { srcName: "Title/Run480.jpg", name: "Title" },
];

LoadPacks = [  //
    { srcName: "hero walking 64.png", count: 6, name: "Hero_walking", dimension: 2 },
    { srcName: "hero fly 64.png", count: 6, name: "Hero_flying", dimension: 2 },
    { srcName: "hero idle 64.png", count: 1, name: "Hero_idle", dimension: 2 },
    { srcName: "Bat64.png", count: 3, name: "Bat" },
    { srcName: "RedBat.png", count: 3, name: "RedBat" },
    { srcName: "Skeleton64.png", count: 9, name: "Skeleton" },
];

LoadAudio = [
    { srcName: "Explosion1.mp3", name: "Explosion" },
    { srcName: "laser.mp3", name: "Laser" },
    { srcName: "jetpac.mp3", name: "Jetpac" },
    { srcName: "Which Way Is Away - LaughingSkull.mp3", name: "Title" },
    { srcName: "Fuse.mp3", name: "Fuse" },
    { srcName: "UseScroll.mp3", name: "PickBox" },
    { srcName: "Scream.mp3", name: "Scream" },
];

LoadSheetSequences = [
    { srcName: "Explosion64.png", count: 24, name: "Explosion" },
    { srcName: "SmokeExp64.png", count: 27, name: "SmokeExp" },
    { srcName: "Dynamite.png", count: 2, name: "Dynamite" },
    { srcName: "BrownWall64.png", count: 12, name: "WallTile", trim: false },
    { srcName: "BlackWall64.png", count: 2, name: "BackgroundTile", trim: false },
    { srcName: "d3-64.png", count: 6, name: "D3", trim: false },
    { srcName: "VertiWall64.png", count: 1, name: "VerticalWall", trim: false },
    { srcName: "HoriWall64.png", count: 1, name: "HorizontalWall", trim: true },
    { srcName: "BlockWall64.png", count: 1, name: "BlockWall", trim: false },
    { srcName: "Smoke2.png", count: 12, name: "Smoke" },
    { srcName: "BigBox.png", count: 1, name: "Box" },
    { srcName: "SnakyLeft.png", count: 4, name: "SnakyLeft" },
    { srcName: "SnakyRight.png", count: 4, name: "SnakyRight" },
];
