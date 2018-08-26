pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Battleships.sol";

contract TestSimpleStorage {
  function testInitGameGameIsOpen() public {
    Battleships battleships = Battleships(DeployedAddresses.Battleships());

    bytes32 expectedGameId = battleships.initGame("Alice", 32);
    bytes32[] memory gameId = battleships.getOpenGameIds();

    Assert.equal(gameId[0], expectedGameId, "Open game ID should match");
  }




  /* function testItStoresAValue() public {
    SimpleStorage simpleStorage = SimpleStorage(DeployedAddresses.SimpleStorage());

    simpleStorage.set(89);

    uint expected = 89;

    Assert.equal(simpleStorage.get(), expected, "It should store the value 89.");
  } */

}
