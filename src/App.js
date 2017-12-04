import React, { Component } from 'react';
import { Link } from 'react-router'
import 'tachyons';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="w-100">
        <header className="mw6 center br3 pa3 pa4-ns mv3">
          <div className="tc">
            <div className="">
              <Link to="/" className=""><img className="h4 w4 dib pa2" src="/img/dots.png" alt="Nat? Nat. Nat!" /></Link>
              <div className="">
                <Link to="/" className="no-underline black dim">
                  <h1 className="lh-title f3 mb2 mt0">Nat? Nat. Nat!</h1>
                </Link>
                <h2 className="f5 fw4 gray mv0">A blog about random stuff.</h2>
              </div>
            </div>
          </div>
        </header>

        <div className="mw7 center">
          <div className="pb0 pt2 ph0 mh3 mh4-m mh5-l mt0-ns mt4 bt b--light-gray ">
            {this.props.children}
          </div>
        </div>

        <footer className="pv0 ph3 ph4-m ph5-l mt0-ns mt4 bt b--black-10">
          <p className="db tc center mw6"><a href="http://natwelch.com/">Nat Welch</a> is a Software Reconnaissance Engineer who likes writing software to help humans deal with the chaos. He writes his thoughts on this blog. He thanks you for reading.</p>
          <ul className="list ph3 ph5-ns pv0 tc">
          <li className="dib mr2"><a href="/about" className="f6 f5-ns b db pa2 link dim mid-gray">About</a></li>
          <li className="dib mr2"><a href="https://twitter.com/icco" className="f6 f5-ns b db pa2 link dim mid-gray">Twitter</a></li>
          </ul>
        </footer>
      </div>
    );
  }
}

export default App;
