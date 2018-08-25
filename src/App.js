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
      gameIDToJoin: ""
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








  click(event){
    event.preventDefault()
    const contract = this.state.contractInstance
    const account = this.state.account

    var gameInitializedEvent = contract.GameInitialized();

    gameInitializedEvent.watch ((err, event) => {
      if (err) console.error ('An error occured::::', err);
      console.log ('This is the event::::', event);
      console.log ('THis is the data::::', event.args);
      this.setState({gameInitializedByPlayerAddress : event.args.player1})
      this.setState({gameInitializedByPlayerAlias : event.args.player1Alias})
    })

    var player1Alias = this.state.player1Alias

    contract.initGame(player1Alias, {from: account})
    .then(result => {
      return contract.getOpenGameIds.call()
    })
    .then(result => {
      this.setState({player1LastInitializedGame: result})
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
  var player2Alias = this.state.player2Alias
  var gameID = this.state.gameIDToJoin
  const contract = this.state.contractInstance

  console.log (player2Alias, 'you want to join::::', gameID);

  contract.joinGame(gameID, player2Alias)

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
<form onSubmit={this.click.bind(this)}>
  <input
    type="text"
    name="choose-game-id"
    placeholder="William Wallace"
    value={ this.state.player1Alias }
    onChange={ event => this.setState ({ player1Alias: event.target.value }) } />
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
                name="choose-game-id"
                placeholder="Enter a screen name"
                value={ this.state.player2Alias}
                onChange={ event => this.setState ({ player2Alias: event.target.value }) } />
                <input
                  type="text"
                  name="choose-game-id"
                  placeholder="Enter an open game Id"
                  value={ this.state.gameIDToJoin }
                  onChange={ event => this.setState ({ gameIDToJoin: event.target.value }) } />
                  <button type="submit"> Join </button>
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
