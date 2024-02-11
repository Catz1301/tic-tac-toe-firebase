/* Copyright (c) 2024 by Joshua Miller */
const version = "0.1.1"
console.log('connect4.js loaded, v' + version);
// TODO: PRIORITY 1: Add a way to check for a win
// TODO: PRIORITY 3: Fix scaling issues with board (probably through height)
/// Vars
var isMobile = false;
var boardWidth;
var boardHeight;
var translateX, translateY;
var columns = 7;
var rows = 6;
var padding = 20;
var debugging = false;
var boardSet = false;
var board = [];
var owners = [null, null];
var isGameReady = false;
var basePath = "game/connect4/games";
var gameId;
var isHost = false;
var sessionEnded = false;
var cellWidth;
var cellHeight;
var boardColor;
var currentPlayerName;
var animationSpeed = 5;
var mode = 4; // 4 in a row

var flag_updateBoard = false;

// imgs
var redTokenImg;
var greenTokenImg;

function preload() {
  redTokenImg = loadImage('img/Red Token.svg');
  if (debugging)
    console.debug("Red Token.svg Loaded", redTokenImg);
  greenTokenImg = loadImage('img/Green Token.svg');
  if (debugging)
    console.debug("Green Token.svg Loaded", greenTokenImg);
}

function setup() { // Todo: declare the vars used in this function
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile)
    createCanvas(windowWidth, windowWidth);
  else
    createCanvas(600, 600);
  // pixelDensity(5);
  background(153);
  displayDensity(1);
  if (debugging) {
    // debug_setupOwners();
  }
  line(0, 0, width, height);
  frameRate(60);
  console.debug(width, height)
  boardWidth = width - (padding * 2);
  boardHeight = height - (padding * 2);
  translateX = padding;
  translateY = padding;
  cellWidth = boardWidth / columns;
  cellHeight = boardHeight / rows;
  boardColor = color(8, 229, 255);
  let versionInfo = version.split('.');
  var major = parseInt(versionInfo[0]);
  var minor = parseInt(versionInfo[1]);
  var patch = parseInt(versionInfo[2]);
  if (minor < 1 && major == 0) { // firebase isn't going to be integrated until major version 0, minor 1+ (0.1.* up)
    owners[0] = new Owner("Bob", true);
    owners[1] = new Owner("Elliot", false);
    isGameReady = true;
    currentPlayerName = owners[0].name;
  }
}


function handleClick() {
  let selectedColumn = floor((mouseX - translateX) / (cellWidth));
  console.log(mouseX - translateX, (cellWidth))
  if (debugging)
    console.debug(selectedColumn);
  if (isGameReady)
    makeMove(selectedColumn);
}

function mouseDown() {
  handleClick();
  return false;
}

function touchStarted() {
  handleClick();
  console.log('touchStarted');
}

function keyPressed() {
  // ...
}

function draw() {
  if (!boardSet)
    setupBoard();
  background(29);
  translate(translateX, translateY);
  drawBoard();
  drawTokens();
  if (flag_updateBoard) {
    flag_updateBoard = false;
    updateBoard();
  }
}

function drawTokens() {
  if (isGameReady) {
    for (var i = 0; i < board.length; i++) {
      if (board[i] != null) {
        board[i].advanceAnimation();
        board[i].draw();
      }
    }
  }
}

function setupBoard() {
  for (var i = 0; i < columns * rows; i++) {
    board[i] = null;
  }
  boardSet = true;
}

function resetBoard() {
  for (var i = 0; i < columns * rows; i++) {
    board[i] = null;
  }
  boardSet = false;
}


function drawGrid() {
  var cellWidth = boardWidth / columns;
  var cellHeight = boardHeight / rows;
  stroke(boardColor);
  strokeWeight(4);
  for (let i = 0; i < columns + 1; i++) {
    line(i*cellWidth, 0, i*cellWidth, boardHeight);
  }
  for (let i = 0; i < rows + 1; i++) {
    line(0, i*cellHeight, boardWidth, i*cellHeight);
  }
}

function drawBoard() {
  drawGrid();
}

function getCurrentPlayer() {
  if (currentPlayerName == owners[0].name)
    return owners[0];
  else if (currentPlayerName == owners[1].name)
    return owners[1];
  else {
    let e = new Error("No valid current player. Halting.");
    e.name = "NoValidPlayerError";
    e.prototype.functionName = "getCurrentPlayer";
    noLoop();
    throw e;
  }
}

function findLowestEmptyRow(column) {
  for (let i = rows - 1; i >= 0; i--) {
    if (board[i * columns + column] == null) { // (ROW * COLUMNS) (gets us y) + COLUMN (gets us x)
      if (debugging) {
        console["debug"]("Lowest empty row in column " + column + " is " + i + ".");
        console.debug(i, column, i * columns, i * columns + column);
      }
      return i;
    }
  }
  return -1;
}

function makeMove(column) {
  if (!isGameReady)
    return;
  if (currentPlayerName != nickname)
    return;
  if (board[column] == null) {
    let row = findLowestEmptyRow(column);
    if (row != -1) {
      board[row * columns + column] = new Token(getCurrentPlayer(), column, row);
      flag_updateBoard = true;
    }
  }
}

class Owner {
  constructor(name, isFirstPlayer) {
    this.name = name;
    this.isFirstPlayer = isFirstPlayer;
  }
  
  static parse(JSONData) {
    return new Owner(JSONData.name, JSONData.isFirstPlayer);
  }
}

class Token {
  constructor(owner, column, row) {
    this.owner = owner;
    this.column = column;
    this.row = row;
    this.startingRow = 0;
    this.animating = true;
    this.x = this.column * cellWidth;
    this.y = this.startingRow;
    this.width = cellWidth;
    this.height = cellHeight;
    this.checked = false; 
  }

  advanceAnimation() {
    if (this.animating == true) {
      if (this.y >= (this.row * cellHeight)) {
        this.animating = false;
      } else {
        this.y += animationSpeed;
      }
    }
  }

  draw() {
    if (this.owner.isFirstPlayer)
      image(redTokenImg, this.x, this.y, this.width, this.height);
    else
      image(greenTokenImg, this.x, this.y, this.width, this.height);
  }

  static parse(JSONData) {
    let token = new Token(null, null, null);
    token.owner = Owner.parse(JSONData.owner);
    token.column = JSONData.column;
    token.row = JSONData.row;
    token.startingRow = 0; // XXX it's hardcoded in constructor, probably don't even need to redeclare, tbh
    token.animating = JSONData.animating;
    token.x = token.column * cellWidth; // 
    token.y = token.row * cellHeight; // BUG fails to animate properly. For now, use token.row. FIX: separate animation position from actual position. (animate locally) or AnimationData. AnimationData would have currentFrame, stepsPerFrame (pixels to move per frame), finalFramePosition (would be based on cellHeight locally) or keep a list of tokens currently in animation state, and don't bother those tokens.
    token.width = cellWidth;
    token.height = cellHeight;
    token.checked = JSONData.checked;
    return token;
  }
}

function getHorizontalWinner() {
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns - (columns - mode); column++) { // minus 3 because we're checking 4 in a row, and we don't want to go out of bounds
      let token = board[row * columns + column];
      if (token != null) {
        if (board[row * columns + column + 1] == null || board[row * columns + column + 2] == null || board[row * columns + column + 3] == null)
          continue;
        if (token.owner == board[row * columns + column + 1].owner && token.owner == board[row * columns + column + 2].owner && token.owner == board[row * columns + column + 3].owner) {
          return token.owner;
        }
      }
    }
  }
  return null;
}

function getVerticalWinner() {
  for (let column = 0; column < columns; column++) {
    for (let row = 0; row < rows - (rows - mode); row++) {
      let token = board[row * columns + column];
      if (token != null) {
        if (board[(row + 1) * columns + column] == null || board[(row + 2) * columns + column] == null || board[(row + 3) * columns + column] == null)
          continue;
        if (token.owner == board[(row + 1) * columns + column].owner && token.owner == board[(row + 2) * columns + column].owner && token.owner == board[(row + 3) * columns + column].owner) {
          return token.owner;
        }
      }
    }
  }
  return null;
}

function getDiagonalWinner() {
  for (let row = 0; row < rows - (rows - mode); row++) {
    for (let column = 0; column < columns - (columns - mode); column++) {
      let token = board[row * columns + column];
      if (token != null) {
        if (board[(row + 1) * columns + column + 1] == null || board[(row + 2) * columns + column + 2] == null || board[(row + 3) * columns + column + 3] == null)
          continue;
        if (token.owner == board[(row + 1) * columns + column + 1].owner && token.owner == board[(row + 2) * columns + column + 2].owner && token.owner == board[(row + 3) * columns + column + 3].owner) {
          return token.owner;
        }
      }
    }
  }
  for (let row = 0; row < rows - (rows - mode); row++) {
    for (let column = columns - 1; column > (columns - mode - 1); column--) {
      let token = board[row * columns + column];
      if (token != null) {
        if (board[(row + 1) * columns + column - 1] == null || board[(row + 2) * columns + column - 2] == null || board[(row + 3) * columns + column - 3] == null)
          continue;
        if (token.owner == board[(row + 1) * columns + column - 1].owner && token.owner == board[(row + 2) * columns + column - 2].owner && token.owner == board[(row + 3) * columns + column - 3].owner) {
          return token.owner;
        }
      }
    }
  }
  return null;
}

function getWinner() { // TODO: PRIORITY 1: Fix this function and functiins it calls
  let winner = null;
  winner = getHorizontalWinner();
  if (winner != null)
    return winner;
  winner = getVerticalWinner();
  if (winner != null)
    return winner;
  winner = getDiagonalWinner();
  if (winner != null)
    return winner;
  return winner;
}

///////////////////////////
// firebase stuff
///////////////////////////

function updateBoard() {
  if (!isGameReady) {
    console.warn("Game is not ready yet.");
    return;
  }
  if (currentPlayerName == owners[0].name)
    currentPlayerName = owners[1].name;
  else
    currentPlayerName = owners[0].name;

  let winner = getWinner();
  if (winner != null) {
    sessionEnded = true;
    alert(winner.name + " wins!");
  }
  db.collection(basePath).doc(gameId).update({
    board: JSON.stringify(board),
    currentPlayerName,
  });
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
  // console.log("here")
  listener = db.collection(basePath).doc(`${gameId}`)
    .onSnapshot((doc) => {
      if (debugging)
        console.debug("Current data: ", doc.data());

      if (!isGameReady) {
        if (doc.data().owner2 != null) {
          isGameReady = true;
          if (isHost)
            owners[1] = Owner.parse(JSON.parse(doc.data().owner2));
          document.getElementById("opponentName").innerText = "Opponent: " + doc.data().player2;
          document.getElementById("gameId").innerText = "Game ID: " + gameId;
          document.getElementById("hostButton").style.display = "none";
          document.getElementById("joinButton").style.display = "none";
        }
      }

      if (isGameReady) {
        if (doc.data().board != null) {
          if (debugging) {
            console.debug("Board data: ", doc.data().board);
          }
          
          // We don't already change the current player locally.
          if (doc.data().currentPlayerName != null) {
            currentPlayerName = doc.data().currentPlayerName;
          }
          let newBoard = JSON.parse(doc.data().board);
          console.dir(newBoard); 
          for (let i = 0; i < board.length; i++) {
            if (newBoard[i] != null) {
              let token = Token.parse(newBoard[i]);
              
              newBoard[i] = token;
            }
          }
          board = newBoard;
        }
      
      }
    }
    );
}

function hostGame() {
  isHost = true;
  checkForNickname();
  resetBoard();
  /* if (flag_allowAutoMode)
    document.getElementById("autoMode").hidden = false; */
  owners[0] = new Owner(nickname, true);
  currentPlayerName = nickname;
  let pin = Math.floor(Math.random() * 9000) + 1000;
  gameId = pin.toString();
  db.collection(basePath).doc(pin.toString()).set({
    player1: nickname,
    player2: "",
    "board": JSON.stringify(board),
    "owner1": JSON.stringify(owners[0]),
    "owner2": null,
    currentPlayerName
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
      let docRef = db.collection(basePath).doc(gameId);

      docRef.get().then((doc) => {
        if (doc.exists) {
          if (debugging)
            console.debug("Document data:", doc.data());
          alert("Joining Game")
          owners[1] = new Owner(nickname, false);
          owners[0] = Owner.parse(JSON.parse(doc.data().owner1));
          db.collection(basePath).doc(gameId).update({
            player2: nickname,
            owner2: JSON.stringify(owners[1])
          });
          if (debugging) {
            console.dir(doc.data());
            console.dir(doc);
          }
          document.getElementById("opponentName").innerText = "Playing against: " + owners[0].name;
          document.getElementById("hostButton").style.display = "none";
          document.getElementById("joinButton").style.display = "none";
          // Set up a listener for the game
          setListener(gameId);
          isHost = false; 
          // currentPlayerName =
            // sessionEnded = false;
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