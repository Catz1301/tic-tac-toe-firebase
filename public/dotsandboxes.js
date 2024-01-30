console.log("Version 0.1.1");

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
var isGameReady = false;
var translatePx = 5;
var translateX = 0;
var translateY = 0;

var flag_boardChange = false;

// var lineType = {TOP, RIGHT, BOTTOM, LEFT};

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
    // debug_setupOwners();
  }
  line(0, 0, width, height);
  frameRate(60);
  console.debug(width, height)
  boardWidth = width - (padding * 2) - dotDiameter * 2; // subtraxt the diameter of the dots, twice. ones for each side horizontally
  baordHeight = height - (padding * 2) - dotDiameter * 2; // subtraxt the diameter of the dots, twice. ones for each side vertically
  dotSpacing = boardWidth / 4;
  translateX = padding + dotDiameter;
  translateY = padding + dotDiameter;
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

function mouseDown (){
  return false;
}

function touchStarted() {
  console.log("touch started");
  // return false;
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
  translate(translateX, translateY);
  if (!boardSet)
    setupBoard();
  background(29);

  if (flag_boardChange) {
    flag_boardChange = false;
    updateGame();
  }
  drawBoard();
  // pop();
  drawBoxes();
  if (debugging) {
    // debug_setBoxOwners();
    push();
    translate(-translateX, -translateY);
    debug_drawLines();
    debug_drawCanvasBorder();
    pop();
  }

  // pop();
}

function setupBoard() {
  // TODO: Set up vars and call stuff
  boardSet = true;
  let idStart = 0;
  for (let y = 0; y < gridSize - 1; y++) {
    for (let x = 0; x < gridSize - 1; x++) {
      boxes.push(new Box(x * dotSpacing, y * dotSpacing, idStart++));
    }
  }
  // if (debugging) {
  //   // debug_setBoxOwners();
    
  // }
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
    // line.show = true;
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

// returns Owner
function getCurrentPlayer() {
  let currentPlayer = null;
  for (let i = 0; i < owners.length; i++) {
    if (owners[i].name == currentPlayerName) {
      currentPlayer = owners[i];
      break;
    }
  }
  return currentPlayer;
}

class Line {
  constructor(x1, y1, x2, y2, id, horizonal = false) {
    // This needs to be refactored to use the dotSpacing variable
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.show = false;
    this.owner = null;
    this.horizonal = horizonal;
    this.lineId = id;
  }
  draw() {
    if (this.owner == null) {
      // if (!preview) {
      // return;
      // }
      // if (preview) {
      stroke(225);
      strokeWeight(2);
      var X1 = this.x1 + (translateX);
      var X2 = this.x2 + (translateX);
      var Y1 = this.y1 + (translateY);
      var Y2 = this.y2 + (translateY);
      // if (debugging)
      //   console.debug({
      //     X1,
      //     Y1,
      //     X2,
      //     Y2
      //   });
      if (this.horizonal) {
        // if (mousePressed && mouseX > this.x1 + tolerance && mouseY < this.x2 - tolerance && this.horizonal == true)
        if (debugging) {
          stroke(255, 255, 0, 127);
          line(
            X1 - translateX,
            Y1 - translateY - tolerance,
            X2 - translateX,
            Y1 - translateY - tolerance
          );
          stroke(0, 255, 255, 127);
          line(
            X1 - translateX,
            Y1 - translateY + tolerance,
            X2 - translateX,
            Y1 - translateY + tolerance
          );
          // line(this.y1 - tolerance, this.x1, this.y2 + tolerance, this.x2);
        }

        // Preview the line
        //  --
        // if (this.y1 == height) {
        //   stroke(255, 255, 0);
        //   strokeWeight(2);
        //   line(this.x1, this.y1, this.x2, this.y2);
        // }
        if (
            mouseX > X1 + tolerance &&
            mouseX < X2 - tolerance &&
            mouseY > Y1 - tolerance &&
            mouseY < Y2 + tolerance
          ) {
          stroke(255);
          line(this.x1, this.y1, this.x2, this.y2);
          // is the mouse pressed? click the line
          if (isGameReady && (mouseIsPressed || touchStarted.length > 0)) {
            this.owner = getCurrentPlayer(); // determine player from getPlayer() function. getPlayer() will return the player object from the db.
            this.show = true;
            flag_boardChange = true;
          }
          console.log("hey")
        }
        let byteBox = this.lineId >> 8;
        let byteSide = this.lineId & 0x00FF;
        let boxX = byteBox % (gridSize - 1);
        let boxY = Math.floor(byteBox / (gridSize - 1));
        if (boxY == gridSize - 2 && byteSide == 2) {
          // Check if mouseY is near this line
          if (
            mouseY > Y1 - tolerance &&
            mouseY < Y2 + tolerance &&
            mouseX < X1 - tolerance &&
            mouseX > X2 + tolerance
          ) {
            // Do something when mouseY is near this line
            // console.log("MouseY is near this line");
            line(this.x1, this.y1, this.x2, this.y2);
          }
        }
      
    } else {
      if (debugging) {
        
        stroke(255, 255, 0, 127);
        console.log(boxes[boxes.length-1].right.x1)
        if (this.x1 == boxes[boxes.length-1].right.x1 + dotDiameter ) { // for edge lines
          //console.
        }
        // line(this.x1, this.y1, this.x2, this.y2);
        line(
          X1 - translateX - tolerance,
          Y1 - translateY,
          X1 - translateX - tolerance,
          Y2 - translateY
        );
        stroke(0, 255, 255, 127);
        line(
          X1 - translateX + tolerance,
          Y1 - translateY,
          X1 - translateX + tolerance,
          Y2 - translateY
        );
        // line(this.y1 - tolerance, this.x1, this.y2 + tolerance, this.x2);
      }
        
        // line (this.y1)

        //  |
        if (
            mouseY > Y1 + tolerance &&
            mouseY < Y2 - tolerance &&
            mouseX > X1 - tolerance &&
            mouseX < X2 + tolerance
          ) {
          stroke(255)
          line(this.x1, this.y1, this.x2, this.y2);
          if (isGameReady && (mouseIsPressed || touchStarted.length > 0)) {
            // debugger;
            this.owner = getCurrentPlayer();
            this.show = true;
            flag_boardChange = true;
          }
          // console.log("yo");
        }
        
        let byteBox = this.lineId >> 8;
        let byteSide = this.lineId & 0x00FF;
        let boxX = byteBox % (gridSize - 1);
        // let boxY = Math.floor(byteBox / (gridSize - 1));
        if (boxX == 0 && byteSide == 3) {
          // Check if mouseY is near this line
          if (
            mouseX > X1 - tolerance &&
            mouseX < X2 + tolerance &&
            mouseY < Y1 - tolerance &&
            mouseY > Y2 + tolerance
            
          ) {
            // Do something when mouseY is near this line
            // console.log("MouseY is near this line");
            line(this.x1, this.y1, this.x2, this.y2);
          }
        }
      }
      // console.log(mouseX, mouseY)
      stroke(255, 255, 255, 25);
      strokeWeight((tolerance * 2) + 1);

      // line(this.x1, this.y1, this.x2, this.y2); // uncomment to see the tolerance
      // console.log("no Owner");
      // }
    } else { // if the line has an owner
      // let owner = getOwnerFromName(this.owner);
      if (this.owner.color instanceof color) {
        console.log("color is color");
      }
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
  constructor(x, y, id, concatLineArr = true) {
    this.x = x;
    this.y = y;
    let byteBox = id;
    this.top = new Line(x, y, x + dotSpacing, y, ((id << 8) | 0x00), true);
    this.right = new Line(x + dotSpacing, y, x + dotSpacing, y + dotSpacing, ((id << 8) | 0x01), false);
    this.bottom = new Line(x + dotSpacing, y + dotSpacing, x, y + dotSpacing, ((id << 8) | 0x02), true);
    this.left = new Line(x, y + dotSpacing, x, y, ((id << 8) | 0x03), false);
    this.id = id;

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
          this.owner = owners[i];
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

function updateGame() {
  if (!isGameReady) {
    console.log("Game is not ready.");
    return;
  } else {
    //determine whose turn it is
  }
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
  let boxesString = JSON.stringify(boxes);
  console.group("outgoing");
  console.log(boxes);
  console.groupEnd();
  // console.log(boxesString)
  db.collection("game/dotsandboxes/games").doc(gameId).update({
    currentPlayerName: currentPlayerName,
    boxes: boxesString
  });
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
        /* if (isHost) {
          // set owners[0], the first player is always host. only set if not already set
          if (owners[0] == null) {
            owners[0] = parseOwner(doc.data().owner1);
          }
          // if the second player has joined, and the second player has not been set
          if (owners[1] == null) {
            owners[1] = new Owner(doc.data().player2, color(random(0, 255), random(0, 255), random(0, 255)));
          }
        } */
        // if (isHost) {
          console.log("Player 1: ", doc.data().player1);
          console.log("Player 2: ", doc.data().player2);
          owners[0] = parseOwner(doc.data().owner1);
          // if (!isHost)
            owners[1] = new Owner(doc.data().player2, color(random(0, 255), random(0, 255), random(0, 255)));
        isGameReady = true;
      } else if (!isGameReady) {
        return
      } else {
        console.log("Current data: ", doc.data());
        // update the local board
        boxesStr = doc.data().boxes;
        console.log("boxesStr: ", boxesStr);
        boxes = [];
        lines = [];
        
        boxes = parseBoxesString(boxesStr);
        console.group("incoming");
        console.log(boxes);
        console.groupEnd();
        // update the display - Do in drawBoard();
        /* for (let i = 0; i < 9; i++) {
        document.getElementById(i).innerText = boardArr[i];
        } */

        // check for a winner
        // drawBoard();
        // checkEndOfGameStatus();
        // TODO
        if (isHost) {
          document.getElementById("opponentName").innerText = "Playing against: " + doc.data().player2;
        }
      }
    });
}

function parseBoxesString(boxesString) {
  let boxs = [];
  let json = JSON.parse(boxesString);
  console.log("json: ",json)
  for (let i = 0; i < json.length; i++) {
    let box = parseBox(json[i])
    boxs.push(box);
  }
  return boxs;
}

function parseBox(jsonData) {
  //let jsonData = JSON.parse(jsonDataStr);
  console.log("Boxes: ", jsonData)
  let x = jsonData.x;
  let y = jsonData.y;
  // debugger;
  let box = new Box(x, y, jsonData.id, false);
  box.top = parseLine(jsonData.top, jsonData.id, 0);
  box.right = parseLine(jsonData.right, jsonData.id, 1);
  box.bottom = parseLine(jsonData.bottom, jsonData.id, 2);
  box.left = parseLine(jsonData.left, jsonData.id, 3);
  box.horizonal = jsonData.horizonal;
  lines.concat([box.top, box.right, box.bottom, box.left]);
  box.lastCaptured = false;
  box.captured = false;
  return box;
}
// not parsing the owner correctly. check owner of lines when they are clicked
function parseLine(jsonData, id, side) {
  let line = null;
  let boardX = id % (gridSize - 1);
  let boardY = Math.floor(id / (gridSize - 1));
  let parseX = boardX * dotSpacing;
  let parseY = boardY * dotSpacing;
  let parseX2, parseY2;

  if (side == 0) { // TOP
    line = new Line(parseX, parseY, parseX + dotSpacing, parseY, jsonData.lineId, true);
  } else if (side == 1) { // RIGHT
    line = new Line(parseX + dotSpacing, parseY, parseX + dotSpacing, parseY + dotSpacing, jsonData.lineId, false);
  } else if (side == 2) { // BOTTOM
    line = new Line(parseX + dotSpacing, parseY + dotSpacing, parseX, parseY + dotSpacing, jsonData.lineId, true);
  } else if (side == 3) { // LEFT
    line = new Line(parseX, parseY + dotSpacing, parseX, parseY, jsonData.lineId, false);
  } 
  console.log("LINE jsonData: ", jsonData)
  line.show = jsonData.show;
  // if (line.show)
    // debugger;
  console.group("parseLine -- owner info")
  console.log("jsonData.owner: ", jsonData.owner);
  console.log("owners[0].name: ", owners[0].name);
  console.log("owners[1].name: ", owners[1].name);
  console.groupEnd();
  if (jsonData.owner != null) {
    if (jsonData.owner.name == owners[0].name) {
      line.owner = owners[0];
    }
    else if (jsonData.owner.name == owners[1].name) {
      line.owner = owners[1];
      console.log("other owner")
    }
  }
  return line;
}

function parseOwner(jsonDataStr) {
  let jsonData = JSON.parse(jsonDataStr);
  console.debug(jsonData);
  window.jsonData = jsonData;
  let name = jsonData.name;
  let ownerColor = color(jsonData.color.levels[0], jsonData.color.levels[1], jsonData.color.levels[2]);
  return new Owner(name, ownerColor);
}

// TODO: Fix invalid data. Unsupported Field value, custom Owner object. Found in field owner1
function getOwnerFromName(name) {
  let owner = null;
  for (let i = 0; i < owners.length; i++) {
    if (owners[i].name == name) {
      owner = owners[i];
      break;
    }
  }
  if (owner == null) {
    console.error("Owner not found.");
    let e = new DetailedError("Owner not found.");
    e.details = "getOwnerFromName() failed to find owner with name: " + name; ". Did you pass a string argument?";
    e.parentFunction = "getOwnerFromName()";
    e.fileName = "dotsandboxes.js";

    throw e;
    noLoop();
  }
  return owner;
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
    "owner1": JSON.stringify(owners[0]),
    "owner2": null,
    currentPlayerName,
    "gameSize": gridSize - 1
  });
  sessionEnded = false;
  setListener(gameId.toString());
  document.getElementById("hostButton").style.display = "none";
  document.getElementById("joinButton").style.display = "none";
  document.getElementById("opponentName").innerText = "Waiting for opponent...";
  document.getElementById("gameId").innerText = "Game ID: " + pin;
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
            owner2: JSON.stringify(owners[1])
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