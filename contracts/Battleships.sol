pragma solidity ^0.4.2;

contract TurnBasedGame {

    event GameEnded(bytes32 indexed gameId);
    event GameClosed(bytes32 indexed gameId, address indexed player);
    event GameTimeoutStarted(bytes32 indexed gameId, uint timeoutStarted, int8 timeoutState);
    // GameDrawOfferRejected: notification that a draw of the currently turning player
    //                        is rejected by the waiting player
    event GameDrawOfferRejected(bytes32 indexed gameId);


    struct Game {
        address player1;
        address player2;
        string player1Alias;
        string player2Alias;
        address nextPlayer; //the next player who can take a turn
        address winner;
        bool started;
        bool ended;
        uint pot; // What this game is worth: ether paid into the game
        uint player1Winnings;
        uint player2Winnings;
        uint player1Hand;
        uint player1Guess;
      //  bool player1Ready;
        uint player2Hand;
        uint player2Guess;
       // bool player2Ready;
    }

    mapping (bytes32 => Game) public games;

    // stack of open game ids
    mapping (bytes32 => bytes32) public openGameIds;
    bytes32 public head;

    // stack of games of players
    mapping (address => mapping (bytes32 => bytes32)) public gamesOfPlayers;
    mapping (address => bytes32) public gamesOfPlayersHeads;

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


    function initGame(string player1Alias) public payable returns (bytes32) {

        // Generate game id based on player's addresses and current block number
        bytes32 gameId = keccak256(abi.encodePacked(msg.sender,block.number));

        games[gameId].ended = false;

        // Initialize participants
        games[gameId].player1 = msg.sender;
        games[gameId].player1Alias = player1Alias;
        games[gameId].player1Winnings = 0;
        games[gameId].player2Winnings = 0;

        // Initialize game value
        games[gameId].pot = msg.value * 2;

        // Add game to gamesOfPlayers
        gamesOfPlayers[msg.sender][gameId] = gamesOfPlayersHeads[msg.sender];
        gamesOfPlayersHeads[msg.sender] = gameId;

        // Add to openGameIds
        openGameIds[gameId] = head;
        head = gameId;

        return gameId;
    }


    function setPlayerHand(bytes32 gameId, uint value) public {
        if (msg.sender == games[gameId].player1)
            //require(games[gameId].player1Ready == false, "you've already set your hand");
            games[gameId].player1Hand = value;
           // games[gameId].player1Ready = true;
        if (msg.sender == games[gameId].player2)
            //require(games[gameId].player1Ready == false, "you've already set your hand");
            games[gameId].player2Hand = value;
           // games[gameId].player2Ready = true;
    }

    function getPlayerHand(bytes32 gameId, address player) public returns (uint) {
        if (player == games[gameId].player1) {
            return games[gameId].player1Hand;
        }
        if (player == games[gameId].player2) {
            return games[gameId].player2Hand;
        }
    }

    /**
     * Join an initialized game
     * bytes32 gameId: ID of the game to join
     * string player2Alias: Alias of the player that is joining
     */
    function joinGame(bytes32 gameId, string player2Alias) public payable {

        //check that this game was not intitalized by joiner!
        require(games[gameId].player1 != msg.sender, "you can't join your own game!");

        // Check that this game does not have a second player yet
        require(games[gameId].player2 == 0, "this game is full");

        // require second player to match the bet.
        require(msg.value == games[gameId].pot, "you need to match the bet");

        games[gameId].pot += msg.value;

        games[gameId].player2 = msg.sender;
        games[gameId].player2Alias = player2Alias;

        // Add game to gamesOfPlayers
        gamesOfPlayers[msg.sender][gameId] = gamesOfPlayersHeads[msg.sender];
        gamesOfPlayersHeads[msg.sender] = gameId;

        // Remove from openGameIds
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


    }
    function takeTurn(bytes32 gameId) public {
        require(games[gameId].player1 == msg.sender || games[gameId].player2 == msg.sender, "this isn't your game!");
        require(games[gameId].nextPlayer == msg.sender, "its not your turn!");

        if (msg.sender == games[gameId].player1) {
            games[gameId].nextPlayer = games[gameId].player2;
        } else {
            games[gameId].nextPlayer = games[gameId].player1;
        }

        }
}

contract Battleships is TurnBasedGame {

    event GameInitialized(bytes32 indexed gameId, address indexed player1, string player1Alias, uint pot);
    event GameJoined(bytes32 indexed gameId, address indexed player1, string player1Alias, address indexed player2, string player2Alias, uint pot);
    event TurnTaken(address nextPlayer);


    struct playerData {
      uint guess;
    }
    mapping (bytes32 => playerData) public Data;

        /**
     * Initialize a new game
     * string player1Alias: Alias of the player creating the game
     * bool playAsWhite: Pass true or false depending on if the creator will play as white
     */
    function initGame(string player1Alias, uint playerHand) public payable returns (bytes32) {
        bytes32 gameId = super.initGame(player1Alias);

        super.setPlayerHand(gameId, playerHand);
        // Sent notification events
        emit GameInitialized(gameId, games[gameId].player1, player1Alias, games[gameId].pot);
        return gameId;
    }




    /**
     * Join an initialized game
     * bytes32 gameId: ID of the game to join
     * string player2Alias: Alias of the player that is joining
     */
    function joinGame(bytes32 gameId, string player2Alias, uint playerHand) public payable {
        super.joinGame(gameId, player2Alias);
        super.setPlayerHand(gameId, playerHand);
        // for this game the first to play is the entering challenger (player2)
        games[gameId].nextPlayer = msg.sender;


        emit GameJoined(gameId, games[gameId].player1, games[gameId].player1Alias, games[gameId].player2, player2Alias, games[gameId].pot);
}

    function takeTurn(bytes32 gameId, uint guess) public {
      //  address turnTaker = msg.sender;
        super.takeTurn(gameId);
        if (msg.sender == games[gameId].player1) {
            games[gameId].player1Guess = guess;
        } else {
            games[gameId].player2Guess = guess;
        }
        emit TurnTaken(games[gameId].nextPlayer);
    }

}
