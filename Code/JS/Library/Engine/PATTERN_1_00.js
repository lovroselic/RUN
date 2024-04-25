/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

/*
    random PATTERN generation
*/

const PATTERN = {
    VERSION: "1.00",
    CSS: "color: #ff6347",
    INI: {
        SIZE_X: 64,
        SIZE_Y: 64
    },
    pattern: {},
    setSize(sizeX, sizeY = sizeX) {
        this.INI.SIZE_X = sizeX;
        this.INI.SIZE_Y = sizeY;
    },
    create(name, r = [0, 255], g = [0, 255], b = [0, 255], a = 1) {
        let append = '<div id="div_' + name + '" class="hidden"></div>';
        $("body").append(append);
        let canvas = `<canvas id='${name}_canvas' width='${PATTERN.INI.SIZE_X}' height='${PATTERN.INI.SIZE_Y}'></canvas>`;
        $("#div_" + name).append(canvas);

        PATTERN.pattern[name] = {};
        PATTERN.pattern[name].ctx = $("#" + name + "_canvas")[0].getContext("2d");
        PATTERN.pattern[name].img = $("#" + name + "_canvas")[0];
        let CTX = PATTERN.pattern[name].ctx;

        for (var y = 0; y < PATTERN.INI.SIZE_Y; y++) {
            for (var x = 0; x < PATTERN.INI.SIZE_X; x++) {
                setPixel(x, y);
            }
        }

        console.log(`%cCreated pattern: ${name}`, PATTERN.CSS, PATTERN);

        function setPixel(x, y) {
            let A;
            let RGB = [0, 0, 0];

            for (let [index, element] of [r, g, b].entries()) {
                if (typeof (element) == 'object') {
                    RGB[index] = RND(element[0], element[1]);
                } else {
                    RGB[index] = element;
                }
            }

            if (typeof (a) == 'object') {
                A = RNDF(a[0], a[1]);
            } else A = a;

            CTX.fillStyle = `rgba(${RGB[0]},${RGB[1]},${RGB[2]},${A})`;
            CTX.fillRect(x, y, 1, 1);
        }
    }
};


//END
console.log(`%cPATTERN ${PATTERN.VERSION} loaded.`, PATTERN.CSS);