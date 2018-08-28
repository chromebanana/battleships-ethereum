# Play turn based games on a blockchain!

This is a framework for playing turn based guessing games (such as battleships) on a the ethereum blockchain

Players can create games with or with out a wager. Upon creating the game the player also sets the state of their hand

Once a player has created a game, it is avaiable to join using a unique player id. Upon joinng the second player sets the state of thir own hand.

Players take it in turns guessing the state of the others hand.

The contract Battleships.sol actually contains rules for a very basic guessing game. The players each pick a number between 1 to 5 and take it in turns to guess the others number.

It was designed with expandibility in mind. So as well as a Battleships game this abstraction i have written can be easily extended to suit other turn based games.

## Credits
A lot of my initial learning with game design and how to correctly break apart the logic was thanks to this Chess game
https://github.com/ise-ethereum/on-chain-chess

