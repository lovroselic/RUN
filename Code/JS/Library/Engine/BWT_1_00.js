/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

/*
Burrows-Wheeler, RLE text compression
*/

const BWT = {
    VERSION: "1.00",
    CSS: "color: #47A",
    bwt(text) {
        text += "$";
        let bwtArray = [];
        for (let i = 0; i < text.length; i++) {
            let cycle = text.substring(i) + text.substring(0, i);
            bwtArray.push(cycle);
        }
        bwtArray.sort();
        let bwt = "";
        for (let e of bwtArray) {
            bwt += e.substring(e.length - 1);
        }
        return bwt;
    },
    inverseBwt(bwt) {
        let string = "";
        let bwtSorted = {};
        let nodeList = {};
        let L_Shift = [];

        for (let i = 0; i < bwt.length; i++) {
            let c = bwt[i];
            if (!Object.hasOwn(nodeList, c)) {
                nodeList[c] = [];
                bwtSorted[c] = 0;
            }
            nodeList[c].push(i);
            bwtSorted[c] += 1;
        }
        let index = Object.keys(bwtSorted).sort();
        for (let c of index) {
            L_Shift = L_Shift.concat(nodeList[c]);
        }
        let x = L_Shift[0];
        for (let i = 0; i < bwt.length; i++) {
            x = L_Shift[x];
            string += bwt[x];
        }
        return string.substring(0, string.length - 1);
    },
    rle_encode(string) {
        let encoded = "";
        let x = 0;
        let char = "";
        let count = 0;

        while (x < string.length) {
            if (string[x] === char) {
                count++;
            } else {
                if (count > 0) {
                    encoded += char;
                    if (count > 1) {
                        encoded += char;
                        encoded += count.toString();
                    }
                }
                count = 1;
                char = string[x];
            }
            x++;
        }
        encoded += char;
        if (count > 1) {
            encoded += char;
            encoded += count.toString();
        }
        return encoded;
    },
    rle_decode(rle) {
        let decoded = "";
        let x = 0;
        while (x < rle.length) {
            let char = rle[x++];
            if (rle[x] === char) {
                x++;
                let number = /[0-9]+/;
                let N = number.exec(rle.substring(x))[0];
                x += N.length;
                decoded += "".fill(char, parseInt(N, 10));
            } else {
                decoded += char;
            }
        }
        return decoded;
    }
};

//END
console.log(`%cBWT ${BWT.VERSION} loaded.`, BWT.CSS);