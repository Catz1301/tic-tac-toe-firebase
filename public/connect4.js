/* Copyright (c) 2024 by Joshua Miller */
const version = "0.1.0"
console.log('connect4.js loaded, v' + version);
// TODO: Add Firebase integration
// TODO: Add a way to check for a win
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
var cellWidth;
var cellHeight;
var boardColor;
var currentPlayerName;
var animationSpeed = 5;

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
    token.x = JSONData.x; // to avoid more scaling issues, don't use JSONData
    token.y = JSONData.y; // to avoid more scaling issues, don't use JSONData
    token.width = JSONData.width; // to avoid more scaling issues, don't use JSONData
    token.height = JSONData.height; // to avoid more scaling issues, don't use JSONData
    return token;
  }
}

function updateBoard() {
  if (!isGameReady) {
    console.warn("Game is not ready yet.");
    return;
  }
  if (currentPlayerName == owners[0].name)
    currentPlayerName = owners[1].name;
  else
    currentPlayerName = owners[0].name;

  // TODO: Send board off to firestore.
}