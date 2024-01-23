console.log("Version 1.0.2");
// import firebase from "firebase/compat/app";
// Required for side-effects
// import "firebase/firestore";
var boardArr = Array(9).fill(null);
var isHost = undefined; // for testing purposes only. Set accordingly when in prod.
var isMeX = isHost;
var isMeNext = isHost;
var showGameControls = true; // will show the start game and join game buttons
var gameId = "";
var isMyTurn = false;
var isGameReady = false;
var isHostTurn = true;
var didHostPlay = false;
var moves = [];
var iconPlaced = Array(9).fill(false);
var listener = undefined;
var winCheck = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6]
]
var sessionEnded = false;
// console.log(isHost, isMeX, isMeNext);

// returns if it's host's turn or not.
function calculateTurnForHost() {
  let squaresUsed = 0;
  for (let i = 0; i < boardArr.length; i++) {
    if (boardArr[i] != null)
      squaresUsed++;
  }
  console.log((squaresUsed % 2))
  if (squaresUsed % 2 == 1) {
    console.log(squaresUsed % 2 == 1);
    console.log("host Just Played");
    return false; // returns if odd number of squares. Only achievable if host JUST PLAYED.
  } else {
    console.log("opponent just played")
    return true; // returns if even number of squares. Only achievable if host HAS NOT PLAYED.
  }
}

function squareClicked(element) {
  if (sessionEnded == true)
    return;

  let id = element.id;
  console.log(id);

  if (!isGameReady) {
    console.log("Game is not ready.");
    return;
  } else {
    if (isHost && calculateTurnForHost()) {
      setSquare(id);
      // isHostTurn = false;
      // didHostPlay = true;
    } else if (!isHost && !calculateTurnForHost()) {
      setSquare(id);
    }
  }
}

function setSquare(squareId) {
  if (boardArr[squareId] == null) {
    boardArr[squareId] = isMeX ? 'X' : 'O';
    // document.getElementById(squareId).innerText = isMeX ? 'X' : 'O';
  }
  // send off to firebase
  db.collection("game/tictactoe/games").doc(gameId).update({
    board: boardArr
  });
}

function drawBoard() {
  for (let i = 0; i < boardArr.length; i++) {
    if (boardArr[i] != null && iconPlaced[i] == false) {
      let squareEl = document.getElementById(i.toString());
      console.dir(squareEl);
      console.debug({
        squareEl_Width: squareEl.width,
        squareEl_Style: squareEl.style
      })
      let imgEl = document.createElement("img");
      if (boardArr[i] == "X") {
        imgEl.src = "img/x.png";
        imgEl.classList.add("icon");
        //imgEl.style = `width: ${squareEl.clientWidth - 10}; height: ${squareEl.clientWidth - 10};`;
        // imgEl.style = "width: " + squareEl.clientWidth + "; height: " + squareEl.clientWidth - 10 + ";";
        squareEl.appendChild(imgEl);
        iconPlaced[i] = true;
      }
      if (boardArr[i] == "O") {
        imgEl.src = "img/o.png";
        //imgEl.style.width = squareEl.clientWidth - 10;
        //imgEl.style.height = squareEl.clientWidth - 10;
        // imgEl.style = "width: math(100% - 10px); height: " + squareEl.clientWidth - 10;
        imgEl.classList.add("icon");
        squareEl.appendChild(imgEl);
        iconPlaced[i] = true;
      }
    }
  }
}

function checkEndOfGameStatus() {
  drawBoard();
  if (!isGameReady) {
    return;
  }
  let squaresUsed = 0;
  for (let i = 0; i < boardArr.length; i++) {
    if (boardArr[i] != null) {
      squaresUsed++;
    }
  }
  // CONDITIONAL TIME!!!!!!!
  let confirmText;
  if (isHost)
    confirmText = "The opponent will start first.";
  else
    confirmText = "You will start first."
  setTimeout(() => {
    for (let line = 0; line < winCheck.length; line++) {
      let xWin = true;
      let oWin = true;
      let isNotFinished = false;
      for (let i = 0; i < winCheck[line].length; i++) {
        if (boardArr[winCheck[line][i]] == "X") {
          oWin = false;
        } else if (boardArr[winCheck[line][i]] == "O") {
          xWin = false;
        } else {
          xWin = false;
          oWin = false;
          isNotFinished = true;
        }
      }
      if (xWin) {

        if (isHost) {
          confirmText = "The opponent will start first."
        }
        let playAgain = confirm("X has won! Do you want to start a new game? " + confirmText);
        if (playAgain) {
          resetBoard();
          isHost = !isHost;
          isMeX = !isMeX;
        } else {
          sessionEnded = true;
        }
        break;
      } else if (oWin) {
        let playAgain = confirm("O has won! Do you want to start a new game? " + confirmText);
        if (playAgain) {
          resetBoard();
          isHost = !isHost;
          isMeX = !isMeX;
        } else {
          sessionEnded = true;
        }
        break;
      } else {
        console.log("Not yet conclusive.")
      }
      if (sessionEnded == true) {
        db.collection("game/tictactoe/games").doc(gameId).delete();
        if (listener != undefined)
          listener();
        document.getElementById("hostButton").style.display = "";
        document.getElementById("joinButton").style.display = "";
        listener = undefined;
      }
    }

    if (squaresUsed == 9) {
      let playAgain = confirm("Draw! No party won. Do you want to start a new game?" + confirmText);
      if (playAgain) {
        resetBoard();
        isHost = !isHost;
        isMeX = !isMeX;
      }
    }
  }, 1000);
}

function getSquare(squareId) {
  // get from firebase
  return boardArr[squareId];
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

function resetBoard() {
  boardArr = Array(9).fill(null);
  for (let i = 0; i < 9; i++) {
    document.getElementById(i).innerText = "";
  }
  if (gameId != "") {
    try {
      db.collection("game/tictactoe/").doc(gameId).update({
        board: boardArr
      });
    } catch (e) {
      console.error(e);
    }
  }
}

function hostGame() {
  checkForNickname();
  resetBoard();
  // create a game in firebase
  // get the game id
  // display the game id
  // display the join game button
  // hide the host game button
  // generate random 4 digit pin
  let pin = Math.floor(Math.random() * 9000) + 1000;
  gameId = pin.toString();
  db.collection("game/tictactoe/games").doc(pin.toString()).set({
    player1: nickname,
    player2: "",
    board: boardArr
  });
  // document.getElementById("opponentName").innerText = "Playing against: " + doc.data().player2;
  setListener(pin.toString());
  sessionEnded = false;
  document.getElementById("hostButton").style.display = "none";
  document.getElementById("joinButton").style.display = "none";
  document.getElementById("opponentName").innerText = "Waiting for opponent...";
  document.getElementById("gameId").innerText = "Game ID: " + pin;
  isHost = true; // for testing purposes only. Set accordingly when in prod.
  isMeX = isHost;
  isMeNext = isHost;
  isMyTurn = true;
}

function setListener(gameId) {
  console.log("here")
  listener = db.collection("game/tictactoe/games").doc(`${gameId}`)
    .onSnapshot((doc) => {
      if (!isGameReady && doc.data().player1 != "" && doc.data().player2 != "") {
        isGameReady = true;
      }
      console.log("Current data: ", doc.data());
      // update the local board
      boardArr = doc.data().board;
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

function resetGame() {
  resetBoard();
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
      var docRef = db.collection("game/tictactoe/games").doc(gameId);

      docRef.get().then((doc) => {
        if (doc.exists) {
          console.log("Document data:", doc.data());
          alert("Joining Game")
          db.collection("game/tictactoe/games").doc(gameId).update({
            player2: nickname
          });
          console.dir(doc.data());
          console.dir(doc);
          document.getElementById("opponentName").innerText = "Playing against: " + doc.data().player1;
          document.getElementById("hostButton").style.display = "none";
          document.getElementById("joinButton").style.display = "none";
          // Set up a listener for the game
          setListener(gameId);
          isHost = false; // for testing purposes only. Set accordingly when in prod.
          isMeX = isHost;
          isMeNext = true;
          isMyTurn = false;
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