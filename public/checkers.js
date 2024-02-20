/* Copyright (c) 2024 by Joshua Miller */
const version = "0.0.1"
console.log('checkers.js loaded, v' + version);

/// Vars
var isMobile = false;
var boardWidth;
var boardHeight;
var translateX, translateY;
var columns = 8;
var rows = 8;
var padding = 20;
var debugging = true;
var boardSet = false;
var board = [];
var owners = [null, null];
var isGameReady = false;
var basePath = "game/checkers/games";
var gameId;
var isHost = false;
var sessionEnded = false;
var cellWidth;
var cellHeight;
var redTokenImg;
var greenTokenImg;
var currentPlayerName = "";
var boardColor;

var startingTokensBlack = [
   1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23
];
var startingTokensWhite = [
  40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62
];

const TokenType = {
  MAN: 0,
  KING: 1
}

var flag_updateBoard = false;

/// Functions
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
  console.debug(width, height);
  boardWidth = width - (padding * 2);
  boardHeight = boardWidth; //height - ((padding * 2) + ((height / 6) - (width / 7)) );
  translateX = padding;
  translateY = padding;
  cellHeight = boardHeight / rows; //boardHeight / rows;
  cellWidth = boardWidth / columns;
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

function draw() {
  if (!boardSet) {
    setupBoard();
    boardSet = true;
  }
  translate(translateX, translateY);
  background(29);
  drawBoard();
  drawTokens();
}

function setupBoard() {
  for (let i = 0; i < columns * rows; i++) {
    board[i] = null;
  }
  // Since tokens need owners, don't initialize until game is started.
  // TODO: Move into different function, call when hosting game.
  for (let i = 0; i < startingTokensBlack.length; i++) {
    let index = startingTokensBlack[i];
    let column = Math.floor(index % columns);
    let row = Math.floor(index / rows);
    board[index] = new Token(column, row, owners[1]);
  }
  for (let i = 0; i < startingTokensWhite.length; i++) {
    let index = startingTokensWhite[i];
    let column = Math.floor(index % columns);
    let row = Math.floor(index / rows);
    board[index] = new Token(column, row, owners[0]);
  }
}

function drawBoard() {
  // light first
  let showGreen = true;
  let redFirst = false;
  stroke(255);
  strokeWeight(2);
  for (let x = 0; x < columns; x++) {
    line(x * cellWidth, 0, x * cellWidth, boardHeight);
  }
  for (let y = 0; y < rows; y++) {
    line(0, y * cellHeight, boardWidth, y * cellHeight);
  }
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      if (x % 2 == 0 && y % 2 == 0) {
        fill(24, 217, 147);
        rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      } else if (x % 2 == 1 && y % 2 == 1) {
        fill(24, 217, 147);
        rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      } else if (x % 2 == 1 && y % 2 == 0) {
        fill(237, 101, 2);
        rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      } else if (x % 2 == 0 && y % 2 == 1) {
        fill(237, 101, 2);
        rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  }
}

function drawTokens() {
  for (let i = 0; i < board.length; i++) {
    if (board[i] != null) {
      board[i].draw();
    }
  }
}

function clearAllSelected() {
  for (let i = 0; i < board.length; i++) {
    if (board[i] != null) {
      board[i].selected = false;
    }
  }
}

function getSelectedToken() {
  for (let i = 0; i < board.length; i++) {
    if (board[i] != null && board[i].selected)
      return board[i];
  }
}

/// Classes
class Owner {
  constructor(name, isFirstPlayer) {
    this.name = name;
    this.isFirstPlayer = isFirstPlayer; // reminder that first player is black. Red in this instance
  }
  
  static parse(JSONData) {
    return new Owner(JSONData.name, JSONData.isFirstPlayer);
  }
}

/**
 * @class Token
 * 
 */
class Token {
  /**
   * 
   * @param {Number} column The column number
   * @param {Number} row The row number
   * @param {Owner} owner The owner of the token
   */
  constructor(column, row, owner) {
    // this.x = x; // * cellWidth; <-- removed to avoid sync issues
    // this.y = y; // * cellHeight <-- removed to avoid sync issues
    this.column = column;
    this.row = row;
    this.x = this.column * cellWidth;
    this.y = this.row * cellHeight;
    this.owner = owner;
    this.tokenType = TokenType.MAN;
    this.selected = false;
    this.mandatoryMoveLeft = false;
    this.mandatoryMoveRight = false;
  }

  selectIfMousePress() {
    if ((mouseX > this.x && mouseX < this.x + cellWidth) &&
        (mouseY > this.y && mouseY < this.y + cellHeight)) {
          if (mouseIsPressed) {
            clearAllSelected();
            this.selected = true;
          }
    }
  }

  move() {
    if (this.selected && currentPlayerName == this.owner.name) {
      if (this.mandatoryMoveLeft) {
        let upperLeftSquare = board[((this.row - 1) * columns) + (this.column - 1)];
        if (mouseX > upperLeftSquare.x && mouseX < upperLeftSquare.x + cellWidth) {
          if (mouseDown) {
            upperLeftSquare.captureMan();
            this.mandatoryMoveLeft = false;
          }
        }
      } else if (this.mandatoryMoveRight) {
        let upperRightSquare = board[((this.row - 1) * columns) + (this.column + 1)];
        if (mouseX > upperRightSquare.x && mouseX < upperRightSquare.x + cellWidth) {
          if (mouseDown) {
            upperRightSquare.captureMan();
            this.mandatoryMoveRight = false;
          }
        }
      } else {
        // TODO: move
      }
    }
  }

  selectIfMandatoryJump() {
    let upperLeftSquare, upperRightSquare;
    if (this.column != 0)
      upperLeftSquare = board[((this.row - 1) * columns) + (this.column - 1)];
    else
      upperLeftSquare = null;

    if (this.column != columns - 1)
      pperRightSquare = board[((this.row - 1) * columns) + (this.column + 1)];
    else
      upperRightSquare = null;
    
    if (upperLeftSquare != null && upperLeftSquare.owner.name != this.owner.name) {
      this.selected = true;
      this.mandatoryMove = true;
    } else if (upperRightSquare != null && upperRightSquare.owner.name != this.owner.name) {
      this.selected = true;
      this.mandatoryMove = true;
    }
  }

  captureMan() {
    this = null;
  }

  draw() {
    // TODO: draw king version of token if token type is king
    selectIfMousePress();
    selectIfMandatoryJump();
    if (this.owner.isFirstPlayer) {
      if (!this.selected)
        image(redTokenImg, this.x + 3, this.y + 3, cellWidth - 6, cellHeight - 6);
      else
        image(redTokenImg, this.x, this.y, cellWidth, cellHeight);
    } else {
      if (!this.selected)
        image(greenTokenImg, this.x + 3, this.y + 3, cellWidth - 6, cellHeight - 6);
      else
        image(greenTokenImg, this.x, this.y, cellWidth, cellHeight);
    }
  }

  parse(JSONData) {
    let token = new Token(JSONData.column, JSONData.row, Owner.parse(JSONData.owner));
    token.tokenType = JSONData.tokenType;
    token.selected = JSONData.selected;
    token.mandatoryMoveLeft = JSONData.mandatoryMoveLeft;
    token.mandatoryMoveRight = JSONData.mandatoryMoveRight;
    return token;
  }
  
}