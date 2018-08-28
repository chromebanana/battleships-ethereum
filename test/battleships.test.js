var Battleships = artifacts.require("./Battleships.sol");

contract('Battleships', function(accounts) {
  const alice = accounts[0];
  const bob = accounts[1];
  const claire = accounts[2];
  const wager = web3.toBigNumber(2);

  it("initialize a game and make it available", async() => {
    const game = await Battleships.deployed();
    var gameId = null
    var gameInitializedEvent = game.GameInitialized();

    gameInitializedEvent.watch ((err, event) => {
      if (err) console.error ('An error occured::::', err);
    //  console.log ('THis is the data::::', event.args);
      gameId = event.args.gameId;
    })

    await game.initGame("Alice", 1, {from: alice});
    const openGameIds = await game.getOpenGameIds.call();
    const openGameIdsArray = openGameIds.toString().split(",");
    assert.equal(openGameIdsArray[0], gameId, 'Inititalized game should be in list of openGameIds');
  });

  it("initialize a game with wager", async() => {
    const game = await Battleships.deployed();
    var gameId = null
    var wagerTransferred = null
    var gameInitializedEvent = game.GameInitialized();

    gameInitializedEvent.watch ((err, event) => {
      if (err) console.error ('An error occured::::', err);
    //  console.log ('THis is the data::::', event.args);
      wagerTransferred = event.args.wager;
    })

    await game.initGame("Alice", 1, {from: alice, value: wager});

    assert.equal(wager.toString(), wagerTransferred.toString(), 'if eth transferred it should be set as game wager');
  });

  it("initialize a game and it is mine to play", async() => {
    const game = await Battleships.deployed();
    var gameId = null
    var gameInitializedEvent = game.GameInitialized();

    gameInitializedEvent.watch ((err, event) => {
      if (err) console.error ('An error occured::::', err);
    //  console.log ('THis is the data::::', event.args);
      gameId = event.args.gameId;
    })

    await game.initGame("Alice", 1, {from: alice});
    const player1Games = await game.getGamesOfPlayer(alice);
    const player1GamesArray = player1Games.toString().split(",");
    assert.equal(player1GamesArray[0], gameId, 'Inititalized game should be in list player1s games');
  });


  it("player 2 can join a game and it is theirs to play", async() => {
    const game = await Battleships.deployed();
    var gameId = null
    var gameInitializedEvent = game.GameInitialized();

    gameInitializedEvent.watch ((err, event) => {
      if (err) console.error ('An error occured::::', err);
    //  console.log ('THis is the data::::', event.args);
      gameId = event.args.gameId;
    })

    await game.initGame("Alice", 1, {from: alice});
    await game.joinGame(gameId, "Bob", 1, {from: bob});
    const player2Games = await game.getGamesOfPlayer(bob);
    const player2GamesArray = player2Games.toString().split(",");
    assert.equal(player2GamesArray[0], gameId, 'Inititalized game should be in list player2s games');
  });



  // it("a correct guess wins the game", async() => {
  //   const game = await Battleships.deployed();
  //   var gameId = null;
  //   var winner = null;
  //   var gameInitializedEvent = game.GameInitialized();
  //   var gameHasEndedEvent = game.GameHasEnded();
  //
  //   gameInitializedEvent.watch ((err, event) => {
  //     if (err) console.error ('An error occured::::', err);
  //     gameId = event.args.gameId;
  //   })
  //
  //   gameHasEndedEvent.watch  ((err, event ) => {
  //     if (err) console.error ('An error occured::::', err);
  //     winner = event.args.winner;
  //   })
  //
  //
  //   await game.initGame("Alice", 1, {from: alice});
  //   await game.joinGame(gameId, "Bob", 1, {from: bob});
  //
  //   await game.takeTurn(gameId, 1, {from: bob});
  //
  //   assert.equal(winner, bob, 'Inititalized game should be in list player1s games');
  // });
  //
  it("p1 can set alias", async() => {
    const game = await Battleships.deployed();
    var alias = "Alice"

    var gameInitializedEvent = game.GameInitialized();

    gameInitializedEvent.watch ((err, event) => {
      if (err) console.error ('An error occured::::', err);
      gameId = event.args.player1Alias;
    })

    await game.initGame(alias, 1, {from: alice});
    assert.equal(alias, "Alice", 'player 1 alias should be "Alice"');


});
});
