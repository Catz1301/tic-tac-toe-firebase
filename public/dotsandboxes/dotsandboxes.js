/*
oops, my thoughts escaped early.

Node {
    player: string,
    x1 (relative to screen): int
    y1 (relative to screen): int
    x2 (relative to screen): int
    y2 (relative to screen): int
} -- too finicky, unless we determine horizontal or vertical status and give leeway that way. use this approach for drawing.
*/
console.log("Version 0.0");
var boardHeight = 4;
var boardWidth = 4;
var freeNodes = (boardHeight + 1) * (boardWidth + 1);
var isMobileFirst = false;

const screenWidth = window.innerWidth;
if (screenWidth <= 600) {
    isMobileFirst = true;
}

function setup() {
    if (isMobileFirst) {
        createCanvas(screenWidth, screenWidth);
    }
    else {
        createCanvas(600, 600);
    }
}

function draw() {
    background(28, 28, 28);
    // drawBoard();
}