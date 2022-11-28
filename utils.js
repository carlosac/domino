const pile = [];
const board = [];
const player1 = { name: "Tom", hand: [] };
const player2 = { name: "Jerry", hand: [] };

const Dominoe = {
  //populate the tile
  populateTiles: function populateTiles() {
    for (let s = 0; s < 7; s++) {
      for (let f = 0; f <= s; f++) {
        pile.push([f, s]);
      }
    }
    console.log("Tiles populated.", pile);
  },

  //shuffle the pile
  shuffleArray: function shuffleArray() {
    for (let i = pile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pile[i], pile[j]] = [pile[j], pile[i]];
    }
  },

  //hand the shuffled tiles to each player one by one
  handTiles: function handTiles() {
    console.log("Tiles are dealt between two players.");
    let i = 0;
    while (i < 14) {
      player1.hand.push(pile[i]);
      player2.hand.push(pile[i + 1]);
      i += 2;
    }
    pile.splice(0, 14);
    console.log("Player1 ->", player1);
    console.log("Player2 ->", player2);
  },

  //choose first tile to be played randomly
  randomTile: (randomTile = () => Math.floor(Math.random() * 7)),

  //select the first player randomly
  firstStarter: function firstStarter() {
    number = Math.floor(Math.random() * 10);
    let firstPlayer = number % 2 == 0 ? player1 : player2;
    return firstPlayer;
  },

  playFirstTile: function playFirstTile(player) {
    let firstTile = player.hand.splice(randomTile(), 1);
    board.push(firstTile[0]);
    console.log(`${player.name} is starting the game.`);
    console.log(`${player.name} played tile ${firstTile}`);
    console.log("Board is now ->", board);
    this.switchTurn();
  },

  playTile: function playTile(player) {
    for (i of player.hand) {
      if (i[0] == board[0][0]) {
        //reverse the tile and unshift(add to the beginning)
        board.unshift(i.reverse());
        player.hand.splice(player.hand.indexOf(i), 1);
        console.log(`${player.name} played tile ${i}`);
        console.log(`Board is now ->`, board, "\n");
        return true;
      } else if (i[0] == board[board.length - 1][1]) {
        //push(add to the end)
        board.push(i);
        player.hand.splice(player.hand.indexOf(i), 1);
        console.log(`${player.name} played tile ${i}`);
        console.log(`Board is now ->`, board, "\n");
        return true;
      } else if (i[1] == board[0][0]) {
        //unshift(add to the beginning)
        board.unshift(i);
        player.hand.splice(player.hand.indexOf(i), 1);
        console.log(`${player.name} played tile ${i}`);
        console.log(`Board is now ->`, board, "\n");
        return true;
      } else if (i[1] == board[board.length - 1][1]) {
        //reverse the tile and push(add to the end)
        board.push(i.reverse());
        player.hand.splice(player.hand.indexOf(i), 1);
        console.log(`${player.name} played tile ${i}`);
        console.log(`Board is now ->`, board, "\n");
        return true;
      }
    }
    //if player cannot play its tile
    console.log(`${player.name} could not play their hand.`);
    return false;
  },

  //if player does not have a good tile to play, draw one tile from the pile
  singleDrawFromPile: function singleDrawFromPile(player) {
    if (pile.length > 0) {
      console.log(`${player.name} is drawing one tile from the pile.`);
      console.log(`${player.name} drew ${pile[0]}`);
      player.hand.push(pile[0]);
      pile.splice(0, 1);
      return true;
    } else {
      return false;
    }
  },

  //check the winner in cases of draw
  decideWinnerOfDraw: function decideWinnerOfDraw() {
    let winner = "";
    if (player1.hand.length < player2.hand.length) {
      winner = `${player1.name} is the winner with ${player1.hand.length} tiles left in its hand.`;
    } else if (player1.hand.length > player2.hand.length) {
      winner = `${player2.name} is the winner with ${player2.hand.length} tiles left in its hand.`;
    } else {
      winner = "Both players have the same amount of tiles. It is a draw!";
    }
    return winner;
  },

  switchTurn: function switchTurn() {
    return (turn = turn === player1 ? player2 : player1);
  },

  checkWin: function checkWin() {
    if (turn.hand.length == 0) {
      console.log(`${turn.name} won the game!`);
      return true;
    }
  },
};

module.exports = { Dominoe };