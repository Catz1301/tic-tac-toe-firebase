/* Copyright (c) 2024 by Joshua Miller */
const version = "0.0.3a"
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
var boardColorRed;
var boardColorGreen;

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
var flag_manCaptured = false;
var flag_captureOnly = true;

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
  boardColorGreen = color(4, 187, 117); // original: (24, 217, 147)
  boardColorRed = color(207, 71, 2); // original: (237, 101, 2)
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
  if (flag_updateBoard) {
    updateBoard();
  }
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
  let debug_countBoardId = 0;
  for (let y = 0; y < columns; y++) {
    for (let x = 0; x < rows; x++) {
      if (x % 2 == 0 && y % 2 == 0) {
        fill(boardColorGreen);
        rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      } else if (x % 2 == 1 && y % 2 == 1) {
        fill(boardColorGreen);
        rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      } else if (x % 2 == 1 && y % 2 == 0) {
        fill(boardColorRed);
        rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      } else if (x % 2 == 0 && y % 2 == 1) {
        fill(boardColorRed);
        rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
      fill(0)
      if (debugging)
      
        text(debug_countBoardId + "", x * cellWidth + 5, y * cellHeight + 5, (x * cellWidth) + cellWidth - 5, (y * cellHeight) + cellHeight - 5);
      debug_countBoardId++
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

function updateBoard() {
  if (flag_manCaptured == true) {
    flag_manCaptured = false;
    flag_updateBoard = false;
    return; // Not sure if this is the right choice, but for now, just return
  }

  if (currentPlayerName == owners[1].name)
    currentPlayerName = owners[0].name;
  else if (currentPlayerName == owners[0].name)
    currentPlayerName = owners[1].name;
  // TODO: send off to firestore
  flag_updateBoard = false;
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
    this.mandatoryMoveUpLeft = false;
    this.mandatoryMoveUpRight = false;
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
    if (currentPlayerName == owners[0].name) {
      if (this.selected && currentPlayerName == this.owner.name) {
        if (this.mandatoryMoveUpLeft) {
          
          if (this.row == 0 || this.row == 1 || this.column == 1)
            return; // unmovable anyway if true.
          let upperLeftCaptureSquare = ((this.row - 1) * columns) + (this.column - 1);
          let upperLeftMoveToSquare = ((this.row - 2) * columns) + (this.column - 2);
          if (board[upperLeftMoveToSquare] != null)
            return; // unmovable anyway if true.
          if ((mouseX > (this.x - cellWidth) - cellWidth && mouseX < (this.x - cellWidth)) &&
              (mouseY > (this.y - cellHeight) - cellHeight) && mouseY < (this.y - cellHeight)) {
            console.log("mouse over mandatory upper left square");
            if (mouseIsPressed === true) {
              board[upperLeftCaptureSquare].captureMan();
              this.mandatoryMoveUpLeft = false;
              board[upperLeftMoveToSquare] = new Token(this.column - 2, this.row - 2, this.owner);
              board[(this.row * columns) + this.column] = null;
              /* this.row = this.row - 2;
              this.column = this.column - 2;
              this.x = this.column * cellWidth;
              this.y = this.row * cellHeight;
              upperLefttMoveToSquare = Token.parse(JSON.parse(JSON.stringify(this)), this.owner); */
              flag_updateBoard = true;
            }
          }
        } else if (this.mandatoryMoveUpRight) {
          if (this.row == 0 || this.row == 1 || this.column == columns - 3)
            return; // unmovable anyway if true.
          let upperRightCaptureSquare = ((this.row - 1) * columns) + (this.column + 1);
          let upperRightMoveToSquare = ((this.row - 2) * columns) + (this.column + 2);
          if (board[upperRightMoveToSquare] != null) 
            return; // unmovable anyway if true.
          if ((mouseX > (this.x + cellWidth) + cellWidth && mouseX < ((this.x + cellWidth) + cellWidth) + cellWidth) &&
              (mouseY > (this.y - cellHeight) - cellHeight) && mouseY < (this.y - cellHeight)) {
                console.log("Mouse over mandatory upper right jump spot")
            if (mouseIsPressed === true) {
              board[upperRightCaptureSquare].captureMan();
              this.mandatoryMoveUpRight = false;
              board[upperRightMoveToSquare] = new Token(this.column + 2, this.row - 2, this.owner);
              board[(this.row * columns) + this.column] = null;
              /* this.row = this.row - 2;
              this.column = this.column + 2;
              this.x = this.column * cellWidth;
              this.y = this.row * cellHeight;
              upperRightMoveToSquare = Token.parse(JSON.parse(JSON.stringify(this)), this.owner); */
              flag_updateBoard = true;
            }
          }
        } else {
          // move up left
          if ((mouseX > (this.x - cellWidth) && mouseX < (this.x)) &&
          (mouseY > this.y - cellHeight && mouseY < this.y)) {
            if (mouseIsPressed === true) {
              if (this.row == 0 || this.column == 0)
                return;

              let upperLeftSquare = ((this.row - 1) * columns) + (this.column - 1);
              // upperLeftSquare.captureMan();
              // this.mandatoryMoveLeft = false;
              board[upperLeftSquare] = new Token(this.column - 1, this.row - 1, this.owner);
              board[(this.row * columns) + this.column] = null;
              /* this.row = this.row - 1;
              this.column = this.column - 1;
              this.x = this.column * cellWidth;
              this.y = this.row * cellHeight;
              upperLeftSquare = Token.parse(JSON.parse(JSON.stringify(this)), this.owner) */
              flag_updateBoard = true;
            }
          }

          // move up right;
          if ((mouseX > (this.x + cellWidth) && mouseX < (this.x + (cellWidth * 2))) && 
          (mouseY > (this.y - cellHeight) && (mouseY < this.y))) {
            console.log("mouse over upperRight Square")
            
            if (mouseIsPressed === true) {
              if (this.row == 0 || this.column == columns - 1)
                return;
              
              let upperRightSquare = ((this.row - 1) * columns) + (this.column + 1);
              board[upperRightSquare] = new Token(this.column + 1, this.row - 1, this.owner);
              board[(this.row * columns) + this.column] = null;
              /* 
              upperRightSquare
              // upperRightSquare.captureMan();
              // this.mandatoryMoveRight = false;
              // upperRightSquare = this;
              this.row = this.row - 1;
              this.column = this.column + 1;
              this.x = this.column * cellWidth;
              this.y = this.row * cellHeight;
              upperRightSquare = Token.parseWithOwner(JSON.parse(JSON.stringify(this)), this.owner) */
              flag_updateBoard = true;
              
            }
          }
        }
      }
    } else { // for player 2
      if (this.selected && currentPlayerName == this.owner.name) {
        if (this.mandatoryMoveDownLeft) {
          
          if (this.row == rows - 1  || this.row == rows - 2 || this.column == 1) // rows - 2 = 6 + 2
            return; // unmovable anyway if true.
          let lowerLeftCaptureSquare = ((this.row + 1) * columns) + (this.column - 1);
          let lowerLeftMoveToSquare = ((this.row + 2) * columns) + (this.column - 2);
          if (board[lowerLeftMoveToSquare] != null)
            return; // unmovable anyway if true.
          if ((mouseX > (this.x - cellWidth) - cellWidth && mouseX < (this.x - cellWidth)) &&
              (mouseY > (this.y + cellHeight) + cellHeight) && mouseY < ((this.y + cellHeight) + cellHeight) + cellHeight) {
            console.log("mouse over mandatory lower left square");
            if (mouseIsPressed === true) {
              board[lowerLeftCaptureSquare].captureMan();
              // sould check for more capturable men from this token here.
              this.mandatoryMoveDownLeft = false;
              board[lowerLeftMoveToSquare] = new Token(this.column - 2, this.row + 2, this.owner);
              board[(this.row * columns) + this.column] = null;

              flag_updateBoard = true;
            }
          }
        } else if (this.mandatoryMoveDownRight) {
          if (this.row == rows - 1 || this.row == rows - 2 || this.column == columns - 3)
            return; // unmovable anyway if true.
          let lowerRightCaptureSquare = ((this.row + 1) * columns) + (this.column + 1);
          let lowerRightMoveToSquare = ((this.row + 2) * columns) + (this.column + 2);
          if (board[lowerRightMoveToSquare] != null)
            return; // unmovable anyway if true.
          if ((mouseX > (this.x + cellWidth) + cellWidth && mouseX < ((this.x + cellWidth) + cellWidth) + cellWidth) &&
              (mouseY > (this.y + cellHeight) + cellHeight) && mouseY < ((this.y + cellHeight) + cellHeight) + cellHeight) {
            if (mouseIsPressed === true) {
              board[lowerRightCaptureSquare].captureMan();
              this.mandatoryMoveDownRight = false;
              board[lowerRightMoveToSquare] = new Token(this.column + 2, this.row + 2, this.owner);
              board[(this.row * columns) + this.column] = null;

              flag_updateBoard = true;
            }
          }
        } else {
          // move down left
          if ((mouseX > (this.x - cellWidth) && mouseX < (this.x)) &&
          (mouseY > (this.y + cellHeight) && mouseY < (this.y + cellHeight) + cellHeight)) {
            if (mouseIsPressed === true) {
              if (this.row == rows - 1 || this.column == 0)
                return;

              let lowerLeftSquare = ((this.row + 1) * columns) + (this.column - 1);
              board[lowerLeftSquare] = new Token(this.column - 1, this.row + 1, this.owner);
              board[(this.row * columns) + this.column] = null;
              
              flag_updateBoard = true;
            }
          }

          // move down right;
          if ((mouseX > (this.x + cellWidth) && mouseX < (this.x + (cellWidth * 2))) && 
          (mouseY > (this.y + cellHeight) && (mouseY < this.y + cellHeight) + cellHeight)) {
            console.log("mouse over lowerRight Square")
            
            if (mouseIsPressed === true) {
              if (this.row == rows - 1 || this.column == columns - 1)
                return;
              
              let lowerRightSquare = ((this.row + 1) * columns) + (this.column + 1);
              board[lowerRightSquare] = new Token(this.column + 1, this.row + 1, this.owner);
              board[(this.row * columns) + this.column] = null;
              
              flag_updateBoard = true;
            }
          }
        }
      }
    }
  }

  selectIfMandatoryJump() {
    let upperLeftSquare, upperRightSquare, lowerLeftSquare, lowerRightSquare;
    let upperLeftJumpSpot, upperRightJumpSpot, lowerLeftJumpSpot, lowerRightJumpSpot;

    if (this.column != 0 && this.row != 0) // unmovable anyway if true.
      upperLeftSquare = board[((this.row - 1) * columns) + (this.column - 1)];
    else
      upperLeftSquare = null;

    if (this.column != columns - 1 && this.row != 0) // unmovable anyway if true.
      upperRightSquare = board[((this.row - 1) * columns) + (this.column + 1)];
    else
      upperRightSquare = null;
    
    if (this.column != 0 && this.row != rows - 1)
      lowerLeftSquare = board[((this.row + 1) * columns) + (this.column - 1)];
    else
      lowerLeftSquare = null;
    
    if (this.column != columns - 1 && this.row != rows - 1)
      lowerRightSquare = board[((this.row + 1) * columns) + (this.column + 1)];
    else
      lowerRightSquare = null;

    
    if (this.row > 1 && this.column > 1)
      upperLeftJumpSpot = board[((this.row - 2) * columns) + this.column - 2];
    else
      upperLeftJumpSpot = -1; // we can continue only if upperLeftJumpSpot is null, which can only be pulled from board

    if (this.row > 1 && this.column < columns - 3) 
      upperRightJumpSpot = board[((this.row - 2) * columns) + this.column + 2];
    else
      upperRightJumpSpot = -1;

    if (this.row < rows - 3 && this.column > 1)
      lowerLeftJumpSpot = board[((this.row + 2) * columns) + this.column - 2];
    else
      lowerLeftJumpSpot = -1;

    if (this.row < rows - 3 && this.column < columns - 3)
      lowerRightJumpSpot = board[((this.row + 2) * columns) + this.column + 2];


    if (currentPlayerName == owners[0].name) {
      if (upperLeftJumpSpot == null && upperLeftSquare != null && upperLeftSquare.owner.name != this.owner.name) {
        this.selected = true;
        this.mandatoryMoveUpLeft = true;
      } else if (upperRightJumpSpot == null && upperRightSquare != null && upperRightSquare.owner.name != this.owner.name) {
        this.selected = true;
        this.mandatoryMoveUpRight = true;
      }
    } else {
      if (lowerLeftJumpSpot == null && lowerLeftSquare != null && lowerLeftSquare.owner.name != this.owner.name) {
        this.selected = true;
        this.mandatoryMoveDownLeft = true;
      } else if (lowerRightJumpSpot == null && lowerRightSquare != null && lowerRightSquare.owner.name != this.owner.name) {
        this.selected = true;
        this.mandatoryMoveDownRight = true;
      }
    }
  }

  selectIfMousePress() {
    if (mouseIsPressed === true) {
      if ((mouseX > this.x && mouseX < this.x + cellWidth) &&
          (mouseY > this.y && mouseY < this.y + cellHeight)) {
        clearAllSelected()
        this.selected = true;
      }
    }
  }

      /* for (let i = 0; i < board.length; i++) {
        if (board[i] != null) {
          if (board[i].owner.name == currentPlayerName) {
            if ((mouseX > board[i].x && mouseX < board[i].x + cellWidth) &&
                (mouseY > board[i].y && mouseY < board[i].y + cellHeight)) {

            }
          }
        }
      } */
    //}
  //}

  captureMan() {
    // TODO: Destroy;
    // TODO: set a flag to check for any more 
    board[(this.row * columns) + this.column] = null;
    flag_manCaptured = true;
  }

  draw() {
    // TODO: draw king version of token if token type is king
    this.selectIfMousePress();
    this.selectIfMandatoryJump();
    this.move();
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

  static parseWithOwner(JSONData, owner) {
    let token = new Token(JSONData.column, JSONData.row, owner);
    token.tokenType = JSONData.tokenType;
    token.selected = JSONData.selected;
    token.mandatoryMoveUpLeft = JSONData.mandatoryMoveLeft;
    token.mandatoryMoveUpRight = JSONData.mandatoryMoveRight;
    return token;
  }

  static parse(JSONData) {
    let token = new Token(JSONData.column, JSONData.row, Owner.parse(JSONData.owner));
    token.tokenType = JSONData.tokenType;
    token.selected = JSONData.selected;
    token.mandatoryMoveUpLeft = JSONData.mandatoryMoveLeft;
    token.mandatoryMoveUpRight = JSONData.mandatoryMoveRight;
    return token;
  }
  
}