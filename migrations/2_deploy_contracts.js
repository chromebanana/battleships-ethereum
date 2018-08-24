var Battleships = artifacts.require("./Battleships.sol");
var TurnBasedGame = artifacts.require("./TurnBasedGame.sol");

module.exports = function(deployer) {
  deployer.deploy(TurnBasedGame);
  deployer.deploy(Battleships);
};
