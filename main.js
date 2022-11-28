const { Dominoe } = require("./utils");

console.log("Game is starting...");
Dominoe.populateTiles();
Dominoe.shuffleArray();
Dominoe.handTiles();
turn = Dominoe.firstStarter();
Dominoe.playFirstTile(turn);

while (true) {
  if (Dominoe.playTile(turn)) {
    if (Dominoe.checkWin()) {
      break;
    }
    Dominoe.switchTurn();
  } else {
    //draw one tile from the pile
    if (!Dominoe.singleDrawFromPile(turn)) {
      console.log("No more tiles in the pile.");
      console.log(`Result: ${Dominoe.decideWinnerOfDraw()}`);
      break;
    }
    //try playing again with the new tile
    Dominoe.playTile(turn);
    Dominoe.switchTurn();
  }
}
console.log("END OF THE GAME");