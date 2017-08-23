import React, { Component } from 'react';
//import styled from 'tachyons-components'

class App extends Component {
  render() {
    return (
      <div className="App">
      <div className="App-header">
      <h2>Nat? Nat. Nat!</h2>
      </div>
      <div>
      {this.props.children}
      </div>
      </div>
    );
  }
}

export default App;
