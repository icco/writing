import React, { Component } from 'react';
import './App.css';
import styled from 'tachyons-components'

const Header = styled('header')`pv1 ph3 pa4-m pa5-l oh pos-rel mt0-ns mt4`

class App extends Component {
  render() {
    return (
      <div>
      <Header>
      <div class="dt w-100">
      <div class="dtc w-50 v-mid">
      <a href="/"><img src="/img/dots.png" class="v-mid mh0-ns dib-ns db center ph0 w4" alt="Nat? Nat. Nat!"></img></a>
      <div class="dib v-mid pa0 w-100 w-auto-ns">
      <a href="/" class="no-underline black"><h1 class="mb2 mt0 tracked tl-ns tc w-100">Nat? Nat. Nat!</h1></a>
      </div>
      </div>
      </div>
      </Header>


      <div>
      {this.props.children}
      </div>
      </div>
    );
  }
}

export default App;
