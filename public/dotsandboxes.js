console.log("Version 0.0.1");

var isMobile = true;
var boardWidth, boardHeight;
const gridSize = 4 + 1; // add one more to account for the borders
var dotSpacing = -1;
var dotDiameter = 5;
var boardSet = false;
var padding = 10;
var p1 = null;
var p2 = null;
var boxes = [];
var lines = [];
var tolerance = 25; // the amount of pixels the mouse can be off from the line and still be considered on the line
var debugging = true;
function setup() {
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile)
    createCanvas(windowWidth, windowWidth);
  else
    createCanvas(600, 600);
  pixelDensity(5);
  background(153);
  displayDensity(1);
  // p1 = new Owner("Sarah", color(255, 165, 0));
  if (debugging) {
    debug_setupOwners();
  }
  // p2 = new Owner("Joshua", color(0, 127, 255));
  line(0, 0, width, height);
  console.debug(width, height)
  boardWidth = width - padding - dotDiameter * 2; // subtraxt the diameter of the dots, twice. ones for each side horizontally
  baordHeight = height - padding - dotDiameter * 2; // subtraxt the diameter of the dots, twice. ones for each side vertically
  dotSpacing = boardWidth / 4;
}

// event handlers
function mouseMoved(e) {
  // console.log("mouse pressed");
  // console.log(e.x, e.y);
  // boxes.forEach(box => {
  //   console.log(box);
  // });
  push();
  stroke(0, 255, 0);
  fill(255, 0, 255);
  circle(mouseX, mouseY, 10);
  pop();
}

function touchMoved(e) {
  // console.log("touch pressed");
  // console.log(e.x, e.y);
  // boxes.forEach(box => {
  //   console.log(box);
  // });
  push();
  stroke(0, 255, 0);
  fill(255, 0, 255);
  circle(mouseX, mouseY, 10);
  pop();
  return false;
}

function touchStarted() {
  console.log("touch started");
  return false;
}

function draw() {
  // push();
  // scale(0.01);
  translate(dotDiameter + padding, dotDiameter + padding);
  if (!boardSet)
    setupBoard();
  background(29);
  drawBoard();
  drawBoxes();
  if (debugging) {
    debug_drawLines();
  }
  // pop();
}

function setupBoard() {
  // TODO: Set up vars and call stuff
  boardSet = true
  for (let y = 0; y < gridSize - 1; y++) {
    for (let x = 0; x < gridSize - 1; x++) {
      boxes.push(new Box(x * dotSpacing, y * dotSpacing));
    }
  }
  if (debugging) {
    debug_setBoxOwners();
    debug_drawCanvasBorder();
  }
}

function drawBoard() {
  // drawing the dots
  var startNum = 0;
  window.startNum = startNum;
  stroke(255);
  strokeWeight(1);
  for (let y = window.startNum; y < gridSize; y++) {
    for (let x = window.startNum; x < gridSize; x++) {
      noFill();
      circle(x * dotSpacing, y * dotSpacing, dotDiameter);
    }
  }
  // translate(-(dotDiameter + padding), -(dotDiameter + padding));
}

function drawBoxes() {
  boxes.forEach(box => {
    box.draw();
  });
}

function debug_drawLines() {
  lines.forEach(line => {
    line.draw();
  });
}

function debug_setBoxOwners() {
  for (let i = 0; i < boxes.length; i++) {
    if (Math.round(random(0,2)) == 1)// % 2 == 0)
      boxes[i].owner = p1;
    else
      boxes[i].owner = p2;
    // box.owner = p1;
  }
}

function debug_drawCanvasBorder() {
  stroke(0, 255, 0);
  strokeWeight(1);
  line(0, 0, width, 0);
  line(0, 0, 0, height);
  line(width, 0, width, height);
  line(0, height, width, height);

}

function debug_setupOwners() {
  p1 = new Owner("Bob", color(255, 165, 0));
  p2 = new Owner("Elliot", color(0, 127, 255));
}

class Line {
  constructor(x1, y1, x2, y2, horizonal = false) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.show = false;
    this.owner = null;
    this.horizonal = horizonal;
  }
  draw() {
    if (this.owner == null) {
      // if (!preview) {
        // return;
      // }
      // if (preview) {
        stroke(225);
        strokeWeight(2);
        var X1 = this.x1 + (dotDiameter + padding)
        var X2 = this.x2 + (dotDiameter + padding)
        var Y1 = this.y1 + (dotDiameter + padding)
        var Y2 = this.y2 + (dotDiameter + padding)
        if (this.horizonal) {
          // if (mousePressed && mouseX > this.x1 + tolerance && mouseY < this.x2 - tolerance && this.horizonal == true)
          if (debugging) {
            stroke(0, 255, 0);
            line(X1 + tolerance, Y1, X1 + tolerance, Y1);
            line(X2 - tolerance, Y1, X2 - tolerance, Y2);
            // line(this.y1 - tolerance, this.x1, this.y2 + tolerance, this.x2);
          }
          if (mouseX > X1 + tolerance && mouseX < X2 - tolerance && (
            mouseY > Y1 - tolerance && mouseY < Y2 + tolerance
          )) {
            line(this.x1, this.y1, this.x2, this.y2);
            if (mouseIsPressed || touchStarted.length > 0) {
              this.owner = p1; // determine player from getPlayer() function. getPlayer() will return the player object from the db.
              this.show = true;
            }
            console.log("hey")
          }
        } else {
          if (debugging) {
            stroke(0, 255, 0);
            line(X1, Y1 + tolerance, X1, Y2 + tolerance);
            line(X2, Y1 - tolerance, X2, Y2 + tolerance);
            // line(this.y1 - tolerance, this.x1, this.y2 + tolerance, this.x2);
          }
          // line (this.y1)
          if (mouseY > Y1 + tolerance && mouseY < Y2 - tolerance && (
            mouseX > X1 - tolerance && mouseX < X2 + tolerance
          )) {
            line(this.x1, this.y1, this.x2, this.y2);
            if (mouseIsPressed || touchStarted.length > 0) {
              this.owner = p1;
              this.show = true;
            }
            console.log("yo");
          }
        }
        // console.log(mouseX, mouseY)
        stroke(0, 0, 255, 150);
        strokeWeight((tolerance*2) + 1);
        
        // line(this.x1, this.y1, this.x2, this.y2); // uncomment to see the tolerance
        // console.log("no Owner");
      // }
    } else {
      stroke(this.owner.color);
      strokeWeight(2);
      line(this.x1, this.y1, this.x2, this.y2);
    }
  }
}

class Box {
  // try to initialixe x and y to the top left corner of the box
  /* Note: a box is captured when the last line is drawn. 
    We'll make sure to calculate the player name from db when the lines are clicked.
    then iterate all boxes, checking for complete boxes. 
    if a box is complete, 
      add a point to the player who captured it, and set tho owner of the box to the player who captured it. 

    getPlayerFromPacket
    for (all boxes)
      box.isCaptured();
        
      [isCaptured]
        if (box is complete)
          box.owner = player who captured it
          player who captured it.addScore()
  */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.top = new Line(x, y, x + dotSpacing, y, true);
    this.right = new Line(x + dotSpacing, y, x + dotSpacing, y + dotSpacing, false);
    this.bottom = new Line(x + dotSpacing, y + dotSpacing, x, y + dotSpacing, true);
    this.left = new Line(x, y + dotSpacing, x, y, false);
    lines.concat([this.top, this.right, this.bottom, this.left]);
    this.lastCaptured = null;
  }

  isCaptured() {}

  checkComplete() {}

  draw() {
    this.top.draw();
    this.right.draw();
    this.bottom.draw();
    this.left.draw();
    if (this.owner == null) {
      return;
    }
    for (let x = 0; x < dotSpacing; x+=dotSpacing/20) {
      stroke(this.owner.color);
      strokeWeight(2);
      line(this.x, this.y + x, this.x + x, this.y);
      // line(this.x + dotSpacing - x, this.y - x - dotSpacing, this.x + dotSpacing - x, this.y + dotSpacing - x);
      // draw the bottom right to top left
      line(this.x + x, this.y + dotSpacing, this.x + dotSpacing, this.y + x);
    }
  }
}

class Owner {
  constructor(name, color) {
    this.color = color;
    this.score = 0;
    this.name = name;
  }
  
  addScore() {
    this.score++;
  }
  getScoreString() {
    return this.name = "'s score: " + this.score;
  }
}