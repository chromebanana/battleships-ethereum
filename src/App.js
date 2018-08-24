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
      gameInitializedByPlayerAddress: null,
      gameInitializedByPlayerAlias: null,
      newGameInitializedAddress: null
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

    var value = "Alice"



    contract.initGame(value, {from: account})
    .then(result => {
      return contract.getOpenGameIds.call()
    }).then(result => {
      return this.setState({storageValue: result})
      //result.c[0]
    })

  }

  getOpenGames(event){
    const contract = this.state.contractInstance
    //const account = this.state.account

    contract.getOpenGameIds.call()
    .then( result => { this.setState({availableGames: result})})
  }


  render() {



    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <p>Your Truffle Box is installed and ready.</p>
              <h2>Smart Contract Example</h2>
              <p>If your contracts compiled and migrated successfully, below will show a stored value of 5 (by default).</p>
              <p>Try changing the value stored on <strong>line 59</strong> of App.js.</p>
              <p>Your account is: {this.state.account}</p>
              <p>{this.state.gameInitializedBy}, your game is: {this.state.storageValue}</p>
              <button onClick={this.click.bind(this)}>Create Game</button>
              <button onClick={this.getOpenGames.bind(this)}>See All Open Games</button>
              <p> Open Games are: {this.state.openGameIds}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
