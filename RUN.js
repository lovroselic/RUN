/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

/////////////////////////////////////////////////
/*
      
TODO:

known bugs: 

 */
////////////////////////////////////////////////////

var DEBUG = {
    FPS: true,
    BUTTONS: false,
    SETTING: false,
    VERBOSE: false,
    PAINT_TRAIL: false,
    invincible: false,
    INF_LIVES: false,
    GRID: true,
};
var INI = {
    HERO_LATERAL_SPEED: 120,
    MAX_VERTICAL_SPEED: 7,
    A: 10,
    G: 5
};
var PRG = {
    VERSION: "0.02.00",
    NAME: "R.U.N.",
    YEAR: "2022",
    CSS: "color: #239AFF;",
    INIT() {
        console.log("%c**************************************************************************************************************************************", PRG.CSS);
        console.log(`${PRG.NAME} ${PRG.VERSION} by Lovro Selic, (c) C00lSch00l ${PRG.YEAR} on ${navigator.userAgent}`);
        console.log("%c**************************************************************************************************************************************", PRG.CSS);
        $("#title").html(PRG.NAME);
        $("#version").html(`${PRG.NAME} V${PRG.VERSION} <span style='font-size:14px'>&copy</span> C00lSch00l ${PRG.YEAR}`);
        $("input#toggleAbout").val("About " + PRG.NAME);
        $("#about fieldset legend").append(" " + PRG.NAME + " ");

        ENGINE.autostart = true;
        ENGINE.start = PRG.start;
        ENGINE.readyCall = GAME.setup;
        ENGINE.setGridSize(64);
        ENGINE.setSpriteSheetSize(64);
        ENGINE.init();
    },
    setup() {
        console.log("PRG.setup");
        if (DEBUG.SETTING) {
            $('#debug').show();
        } else $('#debug').hide();
        $("#engine_version").html(ENGINE.VERSION);
        $("#grid_version").html(GRID.VERSION);
        $("#maze_version").html(DUNGEON.VERSION);
        $("#lib_version").html(LIB.VERSION);

        $("#toggleHelp").click(function () {
            $("#help").toggle(400);
        });
        $("#toggleAbout").click(function () {
            $("#about").toggle(400);
        });

        //boxes
        ENGINE.gameWIDTH = 768;
        ENGINE.sideWIDTH = 960 - ENGINE.gameWIDTH;
        ENGINE.gameHEIGHT = 768;
        ENGINE.titleHEIGHT = 80;
        ENGINE.titleWIDTH = 960;
        ENGINE.bottomHEIGHT = 40;
        ENGINE.bottomWIDTH = 960;
        ENGINE.checkProximity = false;
        ENGINE.checkIntersection = false;
        ENGINE.setCollisionsafe(49);
        $("#bottom").css("margin-top", ENGINE.gameHEIGHT + ENGINE.titleHEIGHT + ENGINE.bottomHEIGHT);
        $(ENGINE.gameWindowId).width(ENGINE.gameWIDTH + ENGINE.sideWIDTH + 4);
        ENGINE.addBOX("TITLE", ENGINE.titleWIDTH, ENGINE.titleHEIGHT, ["title"], null);
        ENGINE.addBOX("ROOM", ENGINE.gameWIDTH, ENGINE.gameHEIGHT,
            ["background", "actors", "text", "FPS", "button", "click"],
            "side");
        ENGINE.addBOX("SIDE", ENGINE.sideWIDTH, ENGINE.gameHEIGHT,
            ["sideback",],
            "fside");
        ENGINE.addBOX("DOWN", ENGINE.bottomWIDTH, ENGINE.bottomHEIGHT, ["bottom", "bottomText"], null);
        ENGINE.addBOX("LEVEL", ENGINE.gameWIDTH, ENGINE.gameHEIGHT, ["floor", "wall", "grid", "coord"], null);

    },
    start() {
        console.log(PRG.NAME + " started.");
        $(ENGINE.topCanvas).off("mousemove", ENGINE.mouseOver);
        $(ENGINE.topCanvas).off("click", ENGINE.mouseClick);
        $(ENGINE.topCanvas).css("cursor", "");

        $("#startGame").addClass("hidden");
        $(document).keypress(function (event) {
            if (event.which === 32 || event.which === 13) {
                event.preventDefault();
            }
        });
        TITLE.startTitle();
    }
};
var HERO = {
    startInit() {
        this.assetMap = {
            walking: "Hero_walking",
            flying: "Hero_flying",
            idle: "Hero_idle",
            falling: "Hero_idle"
        };
        this.dead = false;
        this.idle = true;
        this.verticalSpeed = 0;
        this.thrust = 0;
        this.floats = false;
    },
    setMode(mode) {
        this.mode = mode;
        this.actor.class = `Hero_${this.mode}`;
        this.actor.asset = ASSET[this.actor.class];
    },
    init() {
        this.mode = 'idle';
        this.moveState = new _2D_MoveState(new FP_Grid(MAP[GAME.level].start.x + 0.5, MAP[GAME.level].start.y + 1), LEFT, this);
        this.actor = new Gravity_ACTOR(`Hero_${this.mode}`, this.x, this.y, 12);
        this.moveState.posToCoord();
    },
    animate(lapsedTime, dir) {
        if (dir) {
            this.moveState.dir = dir;
            this.actor.orientation = this.actor.getOrientation(this.moveState.dir);
        }
        this.actor.updateAnimation(lapsedTime, this.actor.orientation);
        this.actor.refresh();
    },
    setViewport() {
        ENGINE.VIEWPORT.check(this.actor);
        ENGINE.VIEWPORT.alignTo(this.actor);
    },
    setLatMove(D, dir) {
        let Gd = D / ENGINE.INI.GRIDPIX;
        let pos = HERO.moveState.pos.add(dir, Gd);
        let Wd = this.actor.sprite().width / 2 / ENGINE.INI.GRIDPIX;
        let nextGridPos = pos.add(new FP_Vector(0, -0.01)).add(dir, Wd);
        let grid1 = Grid.toClass(nextGridPos);
        let nextGridPos2 = nextGridPos.add(UP, this.actor.sprite().height / ENGINE.INI.GRIDPIX).add(new FP_Vector(0, 0.01));
        let grid2 = Grid.toClass(nextGridPos2);
        let GA = MAP[GAME.level].map.GA;
        //console.log(nextGridPos, nextGridPos2);
        //console.log('HERO',Grid.toClass(HERO.moveState.pos.add(new FP_Vector(0, -0.01))),"->", grid1, GA.notWall(grid1), grid2, GA.notWall(grid2));
        if (GA.notWall(grid1) && GA.notWall(grid2)) {
            HERO.moveState.pos = pos;
        }
        this.moveState.posToCoord();
        this.setViewport();
    },
    verticalMove(lapsedTime) {
        console.log('verticalMove', lapsedTime);
        this.setMode('flying');
        this.animate(lapsedTime);
        this.thrust += INI.A;
    },
    lateralMove(dir, lapsedTime) {
        console.log('lateralMove', dir, lapsedTime);
        let D = INI.HERO_LATERAL_SPEED * lapsedTime / 1000;
        console.log("D", D);
        this.setLatMove(D, dir);
        this.setMode('walking');
        if (this.floats) {
            if (this.verticalSpeed < 0) {
                this.setMode('flying');
            } else {
                this.setMode('idle');
                this.actor.resetIndexes();
                this.actor.refresh();
            }
        }
        this.animate(lapsedTime, dir);
    },
    gravityTest() {
        let Wd = this.actor.sprite().width / 2 / ENGINE.INI.GRIDPIX;
        let forwardPos = HERO.moveState.pos.add(HERO.moveState.dir, Wd);
        let backPos = HERO.moveState.pos.add(HERO.moveState.dir.mirror(), Wd * 0.15);
        let GA = MAP[GAME.level].map.GA;
        if (GA.isWall(Grid.toClass(forwardPos))) return false;
        if (GA.isWall(Grid.toClass(backPos))) return false;
        return true;
    },
    ceilingTest() {
        let Hd = this.actor.sprite().height / ENGINE.INI.GRIDPIX;
        let Wd = this.actor.sprite().width / 2 / ENGINE.INI.GRIDPIX;
        let forwardPos = HERO.moveState.pos.add(HERO.moveState.dir, Wd).add(UP, Hd);
        let backPos = HERO.moveState.pos.add(HERO.moveState.dir.mirror(), Wd * 0.15).add(UP, Hd);
        let GA = MAP[GAME.level].map.GA;
        if (GA.isWall(Grid.toClass(forwardPos))) return true;
        if (GA.isWall(Grid.toClass(backPos))) return true;
        return false;
    },
    manageFlight(lapsedTime) {
        let Hd = this.actor.sprite().height / ENGINE.INI.GRIDPIX;
        if (this.mode === 'idle') {
            this.actor.resetIndexes();
            this.actor.refresh();
        }

        //gravity test
        this.floats = this.gravityTest();
        if (this.floats) {
            this.thrust -= INI.G;
        } else {
            this.verticalSpeed = 0;
            this.floats = false;
            //assure that on the grid, not in the grid
            HERO.moveState.pos.y = Math.floor(HERO.moveState.pos.y);
            //console.log("LANDED", HERO.moveState.pos);
        }

        if (this.thrust !== 0) {
            let dV = this.thrust * lapsedTime / 1000;
            let ceiling = this.ceilingTest();
            if (!ceiling || this.thrust < 0) {
                this.verticalSpeed -= dV;
            }
            if (ceiling && this.thrust > 0) {
                this.verticalSpeed = 0;
            }

            this.verticalSpeed = Math.min(this.verticalSpeed, INI.MAX_VERTICAL_SPEED);
            this.verticalSpeed = Math.max(this.verticalSpeed, -INI.MAX_VERTICAL_SPEED);

            let move = -this.verticalSpeed / ENGINE.INI.GRIDPIX;
            console.log("this.verticalSpeed", this.verticalSpeed, dV, move);
            let pos = HERO.moveState.pos.add(UP, move);
            if (this.verticalSpeed > 0 || (this.verticalSpeed < 0 && !ceiling)) {
                HERO.moveState.pos = pos;
            }
            //console.log("before", HERO.moveState.pos);
            //HERO.moveState.pos.y = Math.max(HERO.moveState.pos.y, Math.floor(HERO.moveState.pos.y) + Hd);
            //console.log("after", HERO.moveState.pos.y, Math.floor(HERO.moveState.pos.y) + Hd);
            this.moveState.posToCoord();
            this.setViewport();
        }
    },
    concludeAction() {
        this.setMode('idle');
        this.thrust = 0;
        //t
    },
    draw() {
        ENGINE.drawBottomCenter('actors', this.actor.vx, this.actor.vy, this.actor.sprite());
        ENGINE.layersToClear.add("actors");
    }
};
var GAME = {
    start() {
        console.log("GAME started");
        if (AUDIO.Title) {
            AUDIO.Title.pause();
            AUDIO.Title.currentTime = 0;
        }
        $(ENGINE.topCanvas).off("mousemove", ENGINE.mouseOver);
        $(ENGINE.topCanvas).off("click", ENGINE.mouseClick);
        $(ENGINE.topCanvas).css("cursor", "");
        ENGINE.hideMouse();
        GAME.extraLife = SCORE.extraLife.clone();

        $("#pause").prop("disabled", false);
        $("#pause").off();
        GAME.paused = false;

        let GameRD = new RenderData("Arcade", 60, "#DDD", "text", "#FFF", 2, 2, 2);
        ENGINE.TEXT.setRD(GameRD);
        ENGINE.watchVisibility(GAME.lostFocus);
        ENGINE.GAME.start(16);
        //GAME.prepareForRestart();
        //GAME.completed = false;
        //GAME.won = false;
        GAME.level = 2;
        GAME.score = 0;
        GAME.lives = 3;
        HERO.startInit();
        //AI.initialize(HERO);
        GAME.fps = new FPS_measurement();
        //ENGINE.GAME.ANIMATION.waitThen(GAME.levelStart, 2);
        GAME.levelStart();
    },
    levelStart() {
        console.log("starting level", GAME.level);
        GAME.levelFinished = false;
        GAME.prepareForRestart();
        //MAP.createNewLevel(GAME.level);
        //HERO.energy = MAP[GAME.level].energy;
        GAME.initLevel(GAME.level);
        GAME.continueLevel(GAME.level);
    },
    initLevel(level) {
        console.log("...level", level, 'initialization');
        if (!MAP[level].unpacked) {
            MAP[level].map = FREE_MAP.import(JSON.parse(MAP[level].data));
            MAP[level].start = Grid.toClass(JSON.parse(MAP[level].start));
            MAP[level].unpacked = true;
        }
        console.log("MAP:", MAP[level]);
        MAP[level].pw = MAP[level].map.width * ENGINE.INI.GRIDPIX;
        MAP[level].ph = MAP[level].map.height * ENGINE.INI.GRIDPIX;
        ENGINE.VIEWPORT.setMax({ x: MAP[level].pw, y: MAP[level].ph });
        //let randomDungeon = RAT_ARENA.create(MAP[level].width, MAP[level].height);
        //MAP[level].DUNGEON = randomDungeon;
        //GRID_SOLO_FLOOR_OBJECT.init(MAP[level].DUNGEON);
        //DESTRUCTION_ANIMATION.init(MAP[level].DUNGEON);
        //SPAWN.gold(level);
        //MAP[level].pw = MAP[level].width * ENGINE.INI.GRIDPIX;
        //MAP[level].ph = MAP[level].height * ENGINE.INI.GRIDPIX;
        //ENGINE.VIEWPORT.setMax({ x: MAP[level].pw, y: MAP[level].ph });
    },
    continueLevel(level) {
        console.log("game continues on level", level);
        //ENEMY_TG.init(MAP[level].DUNGEON);
        //VANISHING.init(MAP[level].DUNGEON);
        //SPAWN.monsters(level);
        HERO.init();
        //HERO.energy = Math.max(Math.round(GRID_SOLO_FLOOR_OBJECT.size / INI.GOLD * MAP[GAME.level].energy), HERO.energy);
        GAME.levelExecute();
    },
    levelExecute() {
        //GAME.CI.reset();
        ENGINE.VIEWPORT.reset();
        HERO.setViewport();
        GAME.drawFirstFrame(GAME.level);
        //GAME.ENEMY.started = false;
        //ENGINE.GAME.ANIMATION.next(GAME.countIn);
        GAME.resume();
    },
    levelEnd() {
        //SPEECH.speak("Good job!");
        //GAME.levelCompleted = true;
        //ENGINE.TEXT.centeredText("LEVEL COMPLETED", ENGINE.gameWIDTH, ENGINE.gameHEIGHT / 4);
        //TITLE.endLevel();
        //ENGINE.GAME.ANIMATION.next(ENGINE.KEY.waitFor.bind(null, GAME.nextLevel, "enter"));
    },
    nextLevel() {
        GAME.level++;
        GAME.levelCompleted = false;
        ENGINE.GAME.ANIMATION.waitThen(GAME.levelStart, 2);
    },
    run(lapsedTime) {
        if (ENGINE.GAME.stopAnimation) return;
        GAME.respond(lapsedTime);
        HERO.manageFlight(lapsedTime);
        GAME.frameDraw(lapsedTime);
        HERO.concludeAction();
    },
    updateVieport() {
        if (!ENGINE.VIEWPORT.changed) return;
        ENGINE.VIEWPORT.change("floor", "background");
        ENGINE.VIEWPORT.change("wall", "background");
        ENGINE.VIEWPORT.changed = false;
    },
    deadRun(lapsedTime) {
        DESTRUCTION_ANIMATION.manage(lapsedTime);
        GAME.deadFrameDraw(lapsedTime);
    },
    deadFrameDraw(lapsedTime) {
        ENGINE.clearLayerStack();

    },
    frameDraw(lapsedTime) {
        ENGINE.clearLayerStack();
        GAME.updateVieport();
        HERO.draw();

        if (DEBUG.FPS) {
            GAME.FPS(lapsedTime);
        }
    },
    drawFirstFrame(level) {
        TITLE.firstFrame();
        ENGINE.resizeBOX("LEVEL", MAP[level].pw, MAP[level].ph);
        ENGINE.TEXTUREGRID.configure("floor", "wall", 'BackgroundTile', 'WallTile');
        ENGINE.TEXTUREGRID.dynamicAssets = { door: "VerticalWall", trapdoor: "HorizontalWall" };
        ENGINE.TEXTUREGRID.set3D('D3');
        ENGINE.TEXTUREGRID.drawTiles(MAP[level].map);
        ENGINE.VIEWPORT.changed = true;
        GAME.updateVieport();
        HERO.draw(0);

        if (DEBUG.GRID) GRID.grid();
    },
    blockGrid(level) {
        GRID.grid();
        GRID.paintCoord("coord", MAP[level].DUNGEON);
    },
    prepareForRestart() {
        let clear = ["background", "text", "FPS", "button"];
        ENGINE.clearManylayers(clear);
        ENGINE.TIMERS.clear();
    },
    setup() {
        console.log("GAME SETUP started");
        $("#buttons").prepend("<input type='button' id='startGame' value='Start Game'>");
        $("#startGame").prop("disabled", true);
    },
    setTitle() {
        const text = GAME.generateTitleText();
        const RD = new RenderData("Adore", 16, "#0E0", "bottomText");
        const SQ = new RectArea(0, 0, LAYER.bottomText.canvas.width, LAYER.bottomText.canvas.height);
        GAME.movingText = new MovingText(text, 4, RD, SQ);
    },
    generateTitleText() {
        let text = `${PRG.NAME} ${PRG.VERSION
            }, a game by Lovro Selic, ${"\u00A9"} C00LSch00L ${PRG.YEAR
            }.  Music: #####' written and performed by LaughingSkull, ${"\u00A9"
            } ### Lovro Selic. `;
        text += "     ENGINE, SPEECH, GRID, MAZE, Burrows-Wheeler RLE Compression and GAME code by Lovro Selic using JavaScript. ";
        text = text.split("").join(String.fromCharCode(8202));
        return text;
    },
    runTitle() {
        if (ENGINE.GAME.stopAnimation) return;
        GAME.movingText.process();
        GAME.titleFrameDraw();
    },
    titleFrameDraw() {
        GAME.movingText.draw();
    },
    lostFocus() {
        if (GAME.paused || false) return;
        GAME.clickPause();
    },
    clickPause() {
        if (false || GAME.levelCompleted) return;
        $("#pause").trigger("click");
        ENGINE.GAME.keymap[ENGINE.KEY.map.F4] = false;
    },
    pause() {
        if (GAME.paused) return;
        //if (GAME.levelFinished) return;
        //if (HERO.dead) return;
        console.log("%cGAME paused.", PRG.CSS);
        $("#pause").prop("value", "Resume Game [F4]");
        $("#pause").off("click", GAME.pause);
        $("#pause").on("click", GAME.resume);
        ENGINE.GAME.ANIMATION.next(ENGINE.KEY.waitFor.bind(null, GAME.clickPause, "F4"));
        ENGINE.TEXT.centeredText("Game Paused", ENGINE.gameWIDTH, ENGINE.gameHEIGHT / 2);
        GAME.paused = true;
        ENGINE.TIMERS.stop();
    },
    resume() {
        console.log("%cGAME resumed.", PRG.CSS);
        $("#pause").prop("value", "Pause Game [F4]");
        $("#pause").off("click", GAME.resume);
        $("#pause").on("click", GAME.pause);
        ENGINE.clearLayer("text");
        ENGINE.TIMERS.start();
        ENGINE.GAME.ANIMATION.resetTimer();
        ENGINE.GAME.ANIMATION.next(GAME.run);
        GAME.paused = false;
    },
    respond(lapsedTime) {
        if (false) return;
        var map = ENGINE.GAME.keymap;

        if (map[ENGINE.KEY.map.F4]) {
            $("#pause").trigger("click");
            ENGINE.TIMERS.display();
            ENGINE.GAME.keymap[ENGINE.KEY.map.F4] = false;
        }
        if (map[ENGINE.KEY.map.F9]) {
            console.log("F9");
        }
        if (map[ENGINE.KEY.map.ctrl]) {
            ENGINE.GAME.keymap[ENGINE.KEY.map.ctrl] = false;
        }
        if (map[ENGINE.KEY.map.left]) {
            HERO.lateralMove(LEFT, lapsedTime);
            //return;
        }
        if (map[ENGINE.KEY.map.right]) {
            HERO.lateralMove(RIGHT, lapsedTime);
            //return;
        }
        if (map[ENGINE.KEY.map.up]) {
            HERO.verticalMove(lapsedTime);
            //return;
        }
        if (map[ENGINE.KEY.map.down]) {
            return;
        }
        return;
    },
    FPS(lapsedTime) {
        let CTX = LAYER.FPS;
        CTX.fillStyle = "white";
        ENGINE.clearLayer("FPS");
        let fps = 1000 / lapsedTime || 0;
        GAME.fps.update(fps);
        CTX.fillText(GAME.fps.getFps(), 5, 10);
    },
    end() {
        ENGINE.showMouse();
        AUDIO.Death.onended = GAME.checkScore;
        AUDIO.Death.play();
    },
    checkScore() {
        SCORE.checkScore(GAME.score);
        SCORE.hiScore();
        TITLE.startTitle();
    },
};
var TITLE = {
    firstFrame() {
        TITLE.clearAllLayers();
        TITLE.sideBackground();
        TITLE.topBackground();
        TITLE.titlePlot();
        TITLE.bottom();
        //TITLE.hiScore();
        //TITLE.score();
        //TITLE.energy();
        //TITLE.lives();
        //TITLE.stage();
        //TITLE.radar();
    },
    startTitle() {
        $("#pause").prop("disabled", true);
        if (AUDIO.Title) AUDIO.Title.play();
        TITLE.clearAllLayers();
        TITLE.blackBackgrounds();
        TITLE.titlePlot();
        $("#DOWN")[0].scrollIntoView();
        ENGINE.topCanvas = ENGINE.getCanvasName("ROOM");
        TITLE.drawButtons();
        GAME.setTitle();
        ENGINE.GAME.start(16);
        ENGINE.GAME.ANIMATION.next(GAME.runTitle);
    },
    clearAllLayers() {
        ENGINE.layersToClear = new Set(["text", "sideback", "button", "title"]);
        ENGINE.clearLayerStack();
    },
    blackBackgrounds() {
        this.topBackground();
        this.bottomBackground();
        this.sideBackground();
        ENGINE.fillLayer("background", "#000");
    },
    topBackground() {
        var CTX = LAYER.title;
        CTX.fillStyle = "#111";
        CTX.roundRect(0, 0, ENGINE.titleWIDTH, ENGINE.titleHEIGHT,
            { upperLeft: 20, upperRight: 20, lowerLeft: 0, lowerRight: 0 },
            true, true);
    },
    bottomBackground() {
        var CTX = LAYER.bottom;
        CTX.fillStyle = "#111";
        CTX.roundRect(0, 0, ENGINE.bottomWIDTH, ENGINE.bottomHEIGHT,
            { upperLeft: 0, upperRight: 0, lowerLeft: 20, lowerRight: 20 },
            true, true);
    },
    sideBackground() {
        ENGINE.fillLayer("sideback", "#222");
    },
    bottom() {
        this.bottomVersion();
    },
    bottomVersion() {
        ENGINE.clearLayer("bottomText");
        let CTX = LAYER.bottomText;
        CTX.textAlign = "center";
        var x = ENGINE.bottomWIDTH / 2;
        var y = ENGINE.bottomHEIGHT / 2;
        CTX.font = "13px Consolas";
        CTX.fillStyle = "#888";
        CTX.shadowOffsetX = 0;
        CTX.shadowOffsetY = 0;
        CTX.shadowBlur = 0;
        CTX.shadowColor = "#cec967";
        CTX.fillText("Version " + PRG.VERSION + " by Lovro Selič", x, y);
    },
    titlePlot() {
        let CTX = LAYER.title;
        var fs = 42;
        CTX.font = fs + "px Arcade";
        CTX.textAlign = "center";
        let txt = CTX.measureText(PRG.NAME);
        let x = ENGINE.titleWIDTH / 2;
        let y = fs + 10;
        let gx = x - txt.width / 2;
        let gy = y - fs;
        let grad = CTX.createLinearGradient(gx, gy + 10, gx, gy + fs);
        grad.addColorStop("0", "#DDD");
        grad.addColorStop("0.1", "#EEE");
        grad.addColorStop("0.2", "#DDD");
        grad.addColorStop("0.3", "#AAA");
        grad.addColorStop("0.4", "#999");
        grad.addColorStop("0.5", "#666");
        grad.addColorStop("0.6", "#555");
        grad.addColorStop("0.7", "#777");
        grad.addColorStop("0.8", "#AAA");
        grad.addColorStop("0.9", "#CCC");
        grad.addColorStop("1", "#EEE");
        CTX.fillStyle = grad;
        GAME.grad = grad;
        CTX.shadowColor = "#cec967";
        CTX.shadowOffsetX = 2;
        CTX.shadowOffsetY = 2;
        CTX.shadowBlur = 3;
        CTX.fillText(PRG.NAME, x, y);
    },
    drawButtons() {
        ENGINE.clearLayer("button");
        FORM.BUTTON.POOL.clear();
        let x = 36;
        let y = 720;
        let w = 166;
        let h = 24;
        let startBA = new Area(x, y, w, h);
        let buttonColors = new ColorInfo("#F00", "#A00", "#222", "#666", 13);
        let musicColors = new ColorInfo("#0E0", "#090", "#222", "#666", 13);
        FORM.BUTTON.POOL.push(new Button("Start game", startBA, buttonColors, GAME.start));
        x += 1.2 * w;
        let music = new Area(x, y, w, h);
        FORM.BUTTON.POOL.push(new Button("Play title music", music, musicColors, TITLE.music));
        FORM.BUTTON.draw();
        $(ENGINE.topCanvas).on("mousemove", { layer: ENGINE.topCanvas }, ENGINE.mouseOver);
        $(ENGINE.topCanvas).on("click", { layer: ENGINE.topCanvas }, ENGINE.mouseClick);
    },
    music() {
        AUDIO.Title.play();
    },
    /*hiScore() {
        var CTX = LAYER.title;
        var fs = 16;
        CTX.font = fs + "px Garamond";
        CTX.fillStyle = GAME.grad;
        CTX.shadowColor = "#cec967";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 1;
        CTX.textAlign = "left";
        var x = 700;
        var y = 32 + fs;
        var index = SCORE.SCORE.name[0].indexOf("&nbsp");
        var HS;
        if (index > 0) {
            HS = SCORE.SCORE.name[0].substring(0, SCORE.SCORE.name[0].indexOf("&nbsp"));
        } else {
            HS = SCORE.SCORE.name[0];
        }
        var text = "HISCORE: " + SCORE.SCORE.value[0].toString().padStart(6, "0") + " by " + HS;
        CTX.fillText(text, x, y);
    },*/
    /*score() {
        ENGINE.clearLayer("score");
        var CTX = LAYER.score;
        var fs = 16;
        CTX.font = fs + "px Emulogic";
        CTX.fillStyle = GAME.grad;
        CTX.shadowColor = "#cec967";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 2;
        CTX.textAlign = "center";
        var x = ENGINE.sideWIDTH / 2;
        var y = 48;
        CTX.fillText("SCORE", x, y);
        CTX.fillStyle = "#FFF";
        CTX.shadowColor = "#DDD";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 1;
        y += fs + 4;
        CTX.fillText(GAME.score.toString().padStart(6, "0"), x, y);
        if (GAME.score >= GAME.extraLife[0]) {
            GAME.lives++;
            GAME.extraLife.shift();
            TITLE.lives();
        }
    },*/

    /*lives() {
        ENGINE.clearLayer("lives");
        var CTX = LAYER.lives;
        var fs = 16;
        CTX.font = fs + "px Emulogic";
        CTX.fillStyle = GAME.grad;
        CTX.shadowColor = "#cec967";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 2;
        CTX.textAlign = "center";
        var x = ENGINE.sideWIDTH / 2;
        var y = 220;
        CTX.fillText("LIVES", x, y);
        y += fs + 32;
        CTX.shadowColor = "transparent";
        CTX.shadowOffsetX = 0;
        CTX.shadowOffsetY = 0;
        CTX.shadowBlur = 0;
        var spread = ENGINE.spreadAroundCenter(GAME.lives, x, 32);
        for (let q = 0; q < GAME.lives; q++) {
            ENGINE.spriteDraw("lives", spread[q], y, SPRITE.Wizard_front_0);
        }
    },*/
    /*stage() {
        ENGINE.clearLayer("stage");
        var CTX = LAYER.stage;
        var fs = 16;
        CTX.font = fs + "px Emulogic";
        CTX.fillStyle = GAME.grad;
        CTX.shadowColor = "#cec967";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 2;
        CTX.textAlign = "center";
        var x = ENGINE.sideWIDTH / 2;
        var y = 344;
        CTX.fillText("STAGE", x, y);
        CTX.fillStyle = "#FFF";
        CTX.shadowColor = "#DDD";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 1;
        y += fs + 4;
        CTX.fillText(GAME.level.toString().padStart(2, "0"), x, y);
    },*/

    /*gameOver() {
        ENGINE.clearLayer("text");
        var CTX = LAYER.text;
        CTX.textAlign = "center";
        var x = ENGINE.gameWIDTH / 2;
        var y = ENGINE.gameHEIGHT / 2;
        var fs = 64;
        CTX.font = fs + "px Arcade";
        var txt = CTX.measureText("GAME OVER");
        var gx = x - txt.width / 2;
        var gy = y - fs;
        var grad = CTX.createLinearGradient(gx, gy + 10, gx, gy + fs);
        grad.addColorStop("0", "#DDD");
        grad.addColorStop("0.1", "#EEE");
        grad.addColorStop("0.2", "#DDD");
        grad.addColorStop("0.3", "#CCC");
        grad.addColorStop("0.4", "#BBB");
        grad.addColorStop("0.5", "#AAA");
        grad.addColorStop("0.6", "#BBB");
        grad.addColorStop("0.7", "#CCC");
        grad.addColorStop("0.8", "#DDD");
        grad.addColorStop("0.9", "#EEE");
        grad.addColorStop("1", "#DDD");
        CTX.fillStyle = grad;
        CTX.shadowColor = "#FFF";
        CTX.shadowOffsetX = 2;
        CTX.shadowOffsetY = 2;
        CTX.shadowBlur = 3;
        CTX.fillText("GAME OVER", x, y);
    },*/
    endLevel() {

    },
};

// -- main --
$(function () {
    PRG.INIT();
    SPEECH.init();
    PRG.setup();
    ENGINE.LOAD.preload();
    SCORE.init("SC", "RUN", 10, 2500);
    SCORE.loadHS();
    SCORE.hiScore();
    SCORE.extraLife = [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, Infinity];
});