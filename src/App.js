import React, { Component } from 'react';
import styled from 'tachyons-components'

class App extends Component {
  render() {
    const Button = styled('button')`
  f6 f5-ns fw6 dib ba
  b--black-20 bg-blue white
  ph3 ph4-ns pv2 pv3-ns br2
  grow no-underline
`
    return (
      <Button mr2>
      Hello
      </Button>
    );
  }
}

export default App;
