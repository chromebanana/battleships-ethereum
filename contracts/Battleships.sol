pragma solidity ^0.4.24;

/// @title A contract for playing a simple turn based guessing game
/// @author William Cragg
/// @notice You can use this contract as a basis for any turn based game
/// @dev It is most definetly insecure at the moment
contract Battleships {
    event GameHasEnded(bytes32 indexed gameId, address indexed winner);
    event WinningsTransferred(bytes32 indexed gameId, address indexed winner);
    event GameInitialized(bytes32 indexed gameId, address indexed player1, string player1Alias, uint wager);
    event GameJoined(bytes32 indexed gameId, address indexed player1, string player1Alias, address indexed player2, string player2Alias, uint wager);
    event TurnTaken(address nextPlayer, bool targetHit);


    struct TwoPlayerGame {
        address player1; // player 1 always the creater of a game
        address player2; // player 2 is always the challenger/joinee
        string player1Alias;
        string player2Alias;
        address nextPlayer; //the next player who can take a turn
        address winner;
        bool ended;
        uint wager; // ether paid in to the game as a bet (can be zero)
        uint player1Winnings;
        uint player2Winnings;
        uint player1Hand; //to hold state of play for player1
        uint player2Hand; //to hold state of play for player2
    }

    mapping (bytes32 => TwoPlayerGame) public games;

    // mapping for open game ids
    mapping (bytes32 => bytes32) public openGameIds;
    bytes32 public head; //head is to represent top of the pile

    // mapping for games of players
    mapping (address => mapping (bytes32 => bytes32)) public gamesOfPlayers;
    mapping (address => bytes32) public gamesOfPlayersHeads;

    /// @notice gets all the games that a player is part of
    /// @param player The player you want to get the games of
    /// @return an array of game IDs
    function getGamesOfPlayer(address player) constant public returns (bytes32[]) {
        bytes32 playerHead = gamesOfPlayersHeads[player];
        uint counter = 0;
        for (bytes32 ga = playerHead; ga != 0; ga = gamesOfPlayers[player][ga]) {
            counter++;
        }
        bytes32[] memory data = new bytes32[](counter);
        bytes32 currentGame = playerHead;
        for (uint i = 0; i < counter; i++) {
            data[i] = currentGame;
            currentGame = gamesOfPlayers[player][currentGame];
        }
        return data;
    }


      /// @notice gets all the open games made with this contrct
      /// @return an array of game IDs
    function getOpenGameIds() constant public returns (bytes32[]) {
        uint counter = 0;
        for (bytes32 ga = head; ga != 0; ga = openGameIds[ga]) {
            counter++;
        }
        bytes32[] memory data = new bytes32[](counter);
        bytes32 currentGame = head;
        for (uint i = 0; i < counter; i++) {
            data[i] = currentGame;
            currentGame = openGameIds[currentGame];
        }
        return data;
    }

    /// @notice initialize a game with optional wager
    /// @param player1Alias is player 1's chosen screen name
    /// @param playerHand is is player1s chosen game setup, eg battleship position
    /// @return the ID of the initialized game
    function initGame(string player1Alias, uint playerHand) public payable returns (bytes32) {

        // Generate game id based on player's addresses and current block number
        bytes32 gameId = keccak256(abi.encodePacked(msg.sender,block.number));
        games[gameId].ended = false;

        // Initialize player1
        games[gameId].player1 = msg.sender;
        games[gameId].player1Alias = player1Alias;

        // Initialize game value
        games[gameId].wager = msg.value;

        // Add game to list of player1s games
        gamesOfPlayers[msg.sender][gameId] = gamesOfPlayersHeads[msg.sender];
        gamesOfPlayersHeads[msg.sender] = gameId;

        // Add to openGameIds
        openGameIds[gameId] = head;
        head = gameId;

        // set game state for player1
        setPlayerHand(gameId, playerHand);
        // Sent notification events
        emit GameInitialized(gameId, games[gameId].player1, player1Alias, games[gameId].wager);
        return gameId;
    }



    /// @notice set the data for the players game
    /// @dev this could be extended to hold the position of battleships (for example)
    /// @param gameId is the game being set up
    /// @param value is state being stored for the player (TODO - position of the battleships)
    function setPlayerHand(bytes32 gameId, uint value) public {
      require(value > 0, "must be greater than zero");
      require(value < 6, "must be no greater than five");
        if (msg.sender == games[gameId].player1)
            games[gameId].player1Hand = value;
        if (msg.sender == games[gameId].player2)
            games[gameId].player2Hand = value;
    }


    /// @notice join a game with optional wager
    /// @param gameId is the ID of the game you wish to join
    /// @param player2Alias is player 2's chosen screen name
    /// @param playerHand is state being stored for the player (TODO - position of the battleships)
    function joinGame(bytes32 gameId, string player2Alias, uint playerHand) public payable {

        //check that this game was not intitalized by joiner!
        require(games[gameId].player1 != msg.sender, "you can't join your own game!");
        // Check that this game does not have a second player yet
        require(games[gameId].player2 == 0, "this game is full");
        // require second player to match the bet if any made.
        require(msg.value == games[gameId].wager, "you need to match the bet");

        games[gameId].wager += msg.value;
        // Initialize player2
        games[gameId].player2 = msg.sender;
        games[gameId].player2Alias = player2Alias;

        // Add game ID to list of player2's games
        gamesOfPlayers[msg.sender][gameId] = gamesOfPlayersHeads[msg.sender];
        gamesOfPlayersHeads[msg.sender] = gameId;

        // Remove from openGameIds - so no one else tries to join
        if (head == gameId) {
            head = openGameIds[head];
            openGameIds[gameId] = bytes32(0);
        } else {
            for (bytes32 g = head; g != 'end' && openGameIds[g] != 'end'; g = openGameIds[g]) {
                if (openGameIds[g] == gameId) {
                    openGameIds[g] = openGameIds[gameId];
                    openGameIds[gameId] = bytes32(0);
                    break;
                }
            }
        }
        // set game state for player1
        setPlayerHand(gameId, playerHand);
        // for this simple game example the first to play is the entering challenger (player2)
        games[gameId].nextPlayer = msg.sender;
        // inform client that challenger has entered
        emit GameJoined(gameId, games[gameId].player1, games[gameId].player1Alias, games[gameId].player2, player2Alias, games[gameId].wager);

    }


    /// @notice play your turn of the game
    /// @param gameId is the game being played
    /// @param guess is the guess being made by the current player
    function takeTurn(bytes32 gameId, uint guess) public {
        // can only play a turn if the caller is in the game
        require(games[gameId].player1 == msg.sender || games[gameId].player2 == msg.sender, "this isn't your game!");
        // must be callers turn to play
        require(games[gameId].nextPlayer == msg.sender, "its not your turn!");
        // game must still be in play
        require(games[gameId].ended == false, "this game has ended");

        // prepare next player for their turn
        if (msg.sender == games[gameId].player1) {
            games[gameId].nextPlayer = games[gameId].player2;
        } else {
            games[gameId].nextPlayer = games[gameId].player1;
        }

        uint secret;
        bool targetHit = false;
        /// geet the value of the oppenents hand (position of their battleships for comparison)
        if (msg.sender == games[gameId].player1) {
            secret = games[gameId].player2Hand;
        } else {
            secret = games[gameId].player1Hand;
        }
        /// check if on target
        if (guess == secret) {
          games[gameId].winner = msg.sender;// if yes we have a winner!
          endGame(gameId); // and this game should end
          targetHit = true;
        }
        // notify client that the turn is over, whos turn is next and whether the target was hit
        emit TurnTaken(games[gameId].nextPlayer, targetHit);
        }


    /// @notice play your turn of the game
    /// @param gameId is the game being ended
    function endGame(bytes32 gameId) public {
        // game can only end if someone has won
        require(games[gameId].winner == msg.sender, "this game aint over til somebody wins!");
        games[gameId].ended = true;
        // tell client which game has ended and  who won it
        emit GameHasEnded(gameId, games[gameId].winner);

        //if there was a wager tramsfer it to the winner
        if(msg.sender.send(games[gameId].wager)) {
          games[gameId].wager = 0; //reset
          emit WinningsTransferred(gameId, games[gameId].winner);
        }
    }
}
