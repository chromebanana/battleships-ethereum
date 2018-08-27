import React, { Component } from 'react'
import Battleships from '../build/contracts/Battleships.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      contractInstance: null,
      account: null,
      availableGames: null,
      player1Alias: "",
      player1LastInitializedGame: null,
      player2Alias: "",
      gameInitializedByPlayerAddress: null,
      gameInitializedByPlayerAlias: null,
      newGameInitializedAddress: null,
      openGameIds: null,
      gameIDToJoin: "",
      opponentAlias: "",
      opponentAddress: null,
      gameJoined: null,
      myHandAsPlayer1: "",
      myHandAsPlayer2: "",
      pot: null,
      currentGameId: null,
      myGuess: null,
      nextPlayer: null
    }

  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      });
      const contract = require('truffle-contract')
      const battleships = contract(Battleships)

      battleships.setProvider(this.state.web3.currentProvider)

      var battleshipsInstance

    this.state.web3.eth.getAccounts((error, accounts) => {
      battleships.deployed().then((instance) => {
        battleshipsInstance = instance;
        this.setState({
          account: accounts[0],
          contractInstance: battleshipsInstance
        });

        console.log('account::::', this.state.account)
        console.log('account::::', this.state.contractInstance)
      });
    });

  })
    .catch(() => {
      console.log('Error finding web3.')
    })

//    this.state.event = this.state.contractInstance.GameInitialized();

  }








  createGame(event){
    event.preventDefault()
    const contract = this.state.contractInstance
    const account = this.state.account

    var gameInitializedEvent = contract.GameInitialized();

    gameInitializedEvent.watch ((err, event) => {
      if (err) console.error ('An error occured::::', err);
      console.log ('Game created::::', event.args);
      this.setState({gameInitializedByPlayerAddress : event.args.player1})
      this.setState({gameInitializedByPlayerAlias : event.args.player1Alias})
    })

    var player1Alias = this.state.player1Alias
    var myHand = this.state.myHandAsPlayer1

    contract.initGame(player1Alias, myHand, {from: account})
    .then(result => {
      return contract.getOpenGameIds.call()
    })
    .then(result => {
      var openGameIds = result.toString().split(",");
      this.setState({player1LastInitializedGame: openGameIds[0]});
      console.log ('game id:::: ', this.state.player1LastInitializedGame)
    })

  }

  getOpenGames(event){
    const contract = this.state.contractInstance
    //const account = this.state.account
////NOT WORKIGGGGGG
    contract.getOpenGameIds.call()
    .then( result => { this.setState({openGameIds: result})})



  }



joinGame(event){
event.preventDefault()
  const contract = this.state.contractInstance
  const account = this.state.account

  var player2Alias = this.state.player2Alias
  var gameID = this.state.gameIDToJoin
  var myHand = this.state.myHandAsPlayer2

  var gameJoinedEvent = contract.GameJoined();

  gameJoinedEvent.watch ((err, event) => {
    if (err) console.error ('An error occured::::', err);
    console.log ('GAME JOINED::::', event.args);
    this.setState({opponentAlias : event.args.player1Alias})
    this.setState({opponentAddress : event.args.player1})
    this.setState({pot : event.args.pot})
    this.setState({currentGameId : event.args.gameId})
    this.setState({gameJoined : true})

  })


  console.log (player2Alias, 'you want to join::::', gameID);

  contract.joinGame(gameID, player2Alias, myHand, {from: account})

}

takeTurn(event){
  event.preventDefault()
  const contract = this.state.contractInstance
  const account = this.state.account

  var gameId = this.state.currentGameId
  var myGuess = this.state.myGuess
  var turnTakenEvent = contract.TurnTaken();

  turnTakenEvent.watch ((err, event) => {
    if (err) console.error ('An error occured::::', err);
    console.log ('TURN TAKEN::::', event.args)
    this.setState({lastToPlay : event.args.turnTaker})
})

console.log ('taking your turn::::');
contract.takeTurn(gameId, myGuess, {from: account})
}


  render() {



    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading">Built from a Truffle Box by William Cragg</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Battleships + Ethereum</h1>
              <p>Your account is: {this.state.account}</p>
<h2>Create a new game</h2>
<p> Enter the screen name you want other/s to  and click 'Create Game' </p>
<form onSubmit={this.createGame.bind(this)}>
  <input
    type="text"
    name="choose-game-id"
    placeholder="William Wallace"
    value={ this.state.player1Alias }
    onChange={ event => this.setState ({ player1Alias: event.target.value }) } />
    <input
     type="number"
     name="choose-p2-hand"
     min="1" max="5"
     //value={ this.state.myHandAsPlayer1 }
     onChange={ event => this.setState ({ myHand: event.target.value }) } />
    <button type="submit">Create Game</button>
    </form>

                            <p>{this.state.player1Alias}, your game is: {this.state.player1LastInitializedGame}</p>
                      <br />
                              <br />
                              <h2>Join an existing game</h2>
              <button onClick={this.getOpenGames.bind(this)}>See All Open Games</button>
              <p> Open Games are: {this.state.openGameIds}</p>
              <form onSubmit={ this.joinGame.bind(this)}>
              <input
                type="text"
                name="choose-p2-Alias"
                placeholder="Enter a screen name"
                value={ this.state.player2Alias}
                onChange={ event => this.setState ({ player2Alias: event.target.value }) } />
                <input
                  type="text"
                  name="choose-game-id"
                  placeholder="Enter an open game Id"
                  value={ this.state.gameIDToJoin }
                  onChange={ event => this.setState ({ gameIDToJoin: event.target.value }) } />
               <input
                type="number"
                name="choose-p2-hand"
                min="1" max="5"
                //value={ this.state.myHandAsPlayer2 }
                onChange={ event => this.setState ({ myHandAsPlayer2: event.target.value }) } />
                      <button type="submit"> Join </button>
                  </form>
<p> you are now playing against {this.state.opponentAlias} from {this.state.opponentAddress}</p>
<button onClick={this.takeTurn.bind(this)}>See All Open Games</button>
<form onSubmit={ this.takeTurn.bind(this)}>
 <input
  type="number"
  name="take-turn"
  min="1" max="5"
  onChange={ event => this.setState ({ myGuess: event.target.value }) } />
        <button type="submit"> Guess </button>
    </form>
                    </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
            // <button onClick={this.click.bind(this)}>Create Game</button>
