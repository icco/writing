import React, { Component } from 'react';
import { Link } from 'react-router'
import 'tachyons';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <header className="pv1 ph3 pa4-m pa5-l oh pos-rel mt0-ns mt4">
          <div className="dt w-100">
            <div className="dtc w-50 v-mid">
              <Link to="/" className="no-underline black"><img className="v-mid mh0-ns dib-ns db center ph0 w4" src="/img/dots.png" alt="Nat? Nat. Nat!" /></Link>
              <div className="dib v-mid pa0 w-100 w-auto-ns">
                <Link to="/" className="no-underline black"><h1 className="mb2 mt0 tracked tl-ns tc w-100">Nat? Nat. Nat!</h1></Link>
              </div>
            </div>
          </div>
        </header>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default App;
