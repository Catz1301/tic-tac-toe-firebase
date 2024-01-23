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
var debugFrameRate = false;
var owners = [null, null]; // set [0] when hosting game, set [1] when joining game. we always send nickname every write. just check for null player spot, set with player in db write.
var basePath = "game/dotsandboxes/games";
var sessionEnded = false;
var isHost = false;

var flag_boardChange = false;

function setup() {
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile)
    createCanvas(windowWidth, windowWidth);
  else
    createCanvas(600, 600);
  pixelDensity(5);
  background(153);
  displayDensity(1);
  if (debugging) {
    debug_setupOwners();
  }
  line(0, 0, width, height);
  frameRate(60);
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

function keyPressed(event) {
  if (event.keyCode == 46) {
    console.log(46);
    if (!event.repeat) {
      console.log("notHeld");
      // if (event.shiftKey && event.controlKey) {} else
      if (event.shiftKey) {
        console.log("shift");
        if (!debugFrameRate) {
          frameRate(1);
          background(29);
          redraw();
          debugFrameRate = true;
        } else if (debugFrameRate) {
          frameRate(60);
          debugFrameRate = false;
        }
      } else if (event.ctrlKey) {
        debugging = !debugging;
      }
    }
  }
}

function draw() {
  // push();
  // scale(0.01);
  translate(dotDiameter + padding, dotDiameter + padding);
  if (!boardSet)
    setupBoard();
  background(29);

  if (flag_boardChange) {
    flag_boardChange = false;
    update();
  }
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
    if (Math.round(random(0, 2)) == 1) // % 2 == 0)
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

function getLastCapturedBox() {
  let box = null;
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].lastCaptured) {
      box = boxes[i];
      break;
    }
  }
  return box;
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
      var X1 = this.x1 + (dotDiameter + padding);
      var X2 = this.x2 + (dotDiameter + padding);
      var Y1 = this.y1 + (dotDiameter + padding);
      var Y2 = this.y2 + (dotDiameter + padding);
      if (debugging)
        console.debug({
          X1,
          Y1,
          X2,
          Y2
        });
      if (this.horizonal) {
        // if (mousePressed && mouseX > this.x1 + tolerance && mouseY < this.x2 - tolerance && this.horizonal == true)
        if (debugging) {
          stroke(0, 255, 0);
          line(X1 + tolerance, Y1, X1 + padding + tolerance, Y2);
          stroke(255, 0, 255);
          line(X1 - tolerance, Y1, X2 - padding - tolerance, Y2);
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
          line(X1, Y1 + tolerance + padding, X1, Y2 + tolerance + padding);
          stroke(255, 0, 255);
          line(X1, Y1 - tolerance - padding, X2, Y2 - tolerance - padding);
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
            flag_boardChange = true;
          }
          console.log("yo");
        }
      }
      // console.log(mouseX, mouseY)
      stroke(0, 0, 255, 150);
      strokeWeight((tolerance * 2) + 1);

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
  constructor(x, y, concatLineArr = true) {
    this.x = x;
    this.y = y;
    this.top = new Line(x, y, x + dotSpacing, y, true);
    this.right = new Line(x + dotSpacing, y, x + dotSpacing, y + dotSpacing, false);
    this.bottom = new Line(x + dotSpacing, y + dotSpacing, x, y + dotSpacing, true);
    this.left = new Line(x, y + dotSpacing, x, y, false);
    if (concatLineArr)
      lines.concat([this.top, this.right, this.bottom, this.left]);
    this.lastCaptured = false;
    this.captured = false;
  }

  isCaptured() {
    if (!this.captured) {
      if (this.checkComplete()) {
        getLastCapturedBox().lastCaptured = false;
        this.captured = true;
        this.lastCaptured = true;
      }
    }
    return (this.captured);
  } // should return true if 

  checkComplete() {
    if (this.top.owner != null &&
      this.right.owner != null &&
      this.bottom.owner != null &&
      this.left.owner != null) {
      let currentPlayerName = getCurrentPlayer();
      for (let i = 0; i < owners.length; i++) {
        if (owners[i].name === currentPlayerName) {
          this.owner = owners[i]
        }
      }
    }
  }

  draw() {
    this.top.draw();
    this.right.draw();
    this.bottom.draw();
    this.left.draw();
    if (this.owner == null) {
      return;
    }
    for (let x = 0; x < dotSpacing; x += dotSpacing / 20) {
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

function update() {
  let turnEnd = false;
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].isCaptured()) {
      turnEnd = true;
    }
  }
  if (turnEnd) {
    if (currentPlayerName == owners[0]) {
      currentPlayerName = owners[1].name;
    } else {
      currentPlayerName = owners[0].name;
    }
  }
  db.collection(basePath).doc(gameId).update({
    "boxes": JSON.stringify(boxes)
  })
}

function resetBoard() {
  lines = [];
  boxes = [];
  setupBoard();
}

function checkForNickname() {
  var nickname = localStorage.getItem("nickname");
  if (nickname == null) {
    nickname = prompt("Please enter a nickname");
    if (nickname == "") {
      alert("Your nickname cannot be empty.");
      checkForNickname();
    } else {
      localStorage.setItem("nickname", nickname);
    }
  }
  window.nickname = nickname;
  document.getElementById("nickname").innerText = "Nickname: " + nickname;
}

function setListener(gameId) {
  console.log("here")
  listener = db.collection(basePath).doc(`${gameId}`)
    .onSnapshot((doc) => {
      if (!isGameReady && doc.data().player1 != "" && doc.data().player2 != "") {
        if (isHost) {
          owners[1] = owner2;
        } else {
          owners[0] = owner1;
        }
        isGameReady = true;
      }
      console.log("Current data: ", doc.data());
      // update the local board
      boxesStr = doc.data().boxes;
      lines = [];
      boxes = parseBoxesString(boxesStr);
      // update the display - Do in drawBoard();
      /* for (let i = 0; i < 9; i++) {
      document.getElementById(i).innerText = boardArr[i];
      } */

      if (didHostPlay == true) {
        isHostTurn = true;
        didHostPlay = false;
      }
      // check for a winner
      // drawBoard();
      checkEndOfGameStatus();
      // TODO
      if (isHost) {
        document.getElementById("opponentName").innerText = "Playing against: " + doc.data().player2;
      }
    });
}

function parseBoxesString(boxesString) {
  let boxs = [];
  let json = JSON.parse(boxesString);
  for (let i = 0; i < json.length; i++) {
    let box = parseBox(json[i])
    boxs.push(box);
  }
  return boxs;
}

function parseBox(jsonData) {
  let x = jsonData.x;
  let y = jsonData.y;
  let box = new Box(x, y, false);
  box.top = parseLine(jsonData.top);
  box.right = parseLine(jsonData.right);
  box.bottom = parseLine(jsonData.bottom);
  box.left = parseLine(jsonData.left);
  lines.concat([box.top, box.right, box.bottom, box.left]);
  box.lastCaptured = false;
  box.captured = false;
  return box;
}

function parseLine(jsonData) {
  let line = new Line(jsonData.x1, jsonData.y1, jsonData.x2, jsonData.y2, jsonData.horizonal);
  line.show = jsonData.show;
  if (jsonData.owner.name == owners[0].name) {
    line.owner = owners[0];
  } else if (jsonData.owner.name == owners[1].name) {
    line.owner = owners[1];
  }
  return line;
}

function hostGame() {
  checkForNickname();
  resetBoard();
  owners[0] = new Owner(nickname, color(random(0, 255), random(0, 255), random(0, 255)));
  currentPlayerName = nickname;
  let pin = Math.floor(Math.random() * 9000) + 1000;
  gameId = pin.toString();
  db.collection(basePath).doc(pin.toString()).set({
    player1: nickname,
    player2: "",
    "boxes": JSON.stringify(boxes),
    "owner1": owners[0],
    "owner2": null,
    currentPlayerName,
    gameSize
  });
  sessionEnded = false;
  setListener(gameId.toString());
}

function joinGame() {
  checkForNickname();
  resetBoard();
  // get the game id from the user
  // get the game from firebase
  // display the game id
  // hide the join game button
  // hide the host game button
  gameId = prompt("Please enter the game id");
  if (gameId != null && gameId.length == 4) {
    // check to see if letters are in the game id
    if (gameId.match(/[a-z]/i)) {
      alert("Please enter a valid game id");
      joinGame(); // prolly a mem leak here. idk how to fix it
    } else {
      // the goal is to check for an existing document with the gameid. Then make a snapshot listener for the specific document.
      // always update the local board. only update the firebase board when the local board changes.
      /* db.collection("games").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {

          console.log(`${doc.id} => ${doc.data()}`);
      });
      }); */
      var docRef = db.collection(basePath).doc(gameId);

      docRef.get().then((doc) => {
        if (doc.exists) {
          console.log("Document data:", doc.data());
          alert("Joining Game")
          db.collection(basePath).doc(gameId).update({
            player2: nickname,
            "owner2": owners[1]
          });
          console.dir(doc.data());
          console.dir(doc);
          document.getElementById("opponentName").innerText = "Playing against: " + doc.data().player1;
          document.getElementById("hostButton").style.display = "none";
          document.getElementById("joinButton").style.display = "none";
          // Set up a listener for the game
          setListener(gameId);
          isHost = false; // for testing purposes only. Set accordingly when in prod.
          currentPlayerName =
            sessionEnded = false;
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
          alert("No active game with that id");
        }
      }).catch((error) => {
        console.error("Error getting document:", error);
        alert("There was an error retrieving the game. Check the console for more details.")
      });

    }
  }

}