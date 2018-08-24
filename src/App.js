import React, { Component } from 'react'
import Battleships from '../build/contracts/SimpleStorage.json'
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
      contract: null,
      account: null,
      availableGames: null
    }

  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const simpleStorage = contract(Battleships)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    this.state.event = simpleStorage.GameInitialized();

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        simpleStorageInstance = instance

        // Stores a given value, 5 by default.
        return simpleStorageInstance.set(5, {from: accounts[0]})
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return simpleStorageInstance.get.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result.c[0], contract: simpleStorageInstance, account: accounts[0] })
      })
    })
  }

  createGame(event){
    const contract = this.state.contract
    const account = this.state.account

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
    const contract = this.state.contract
    //const account = this.state.account

    contract.getOpenGameIds.call()
    .then( result => { this.setState({availableGames: result})})
  }



  render() {

    this.state.event.watch ((err, event) => {
      if (err) console.error ('An error occured::::', err);
      console.log ('This is the event::::', event);
      console.log ('THis is the experiment result::::', event.args.result);
    })

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
              <p>The stored value is: {this.state.storageValue}</p>
              <button onClick={this.createGame.bind(this)}>Create Game</button>
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
