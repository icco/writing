import React, { Component } from 'react';
import { Link } from 'react-router'
import './App.css';
import styled from 'tachyons-components'

const Header = styled('header')`dt w-100`
const SubHeader = styled('div')`dtc w-50 v-mid`
const Title = styled('h1')`mb2 mt0 tracked tl-ns tc w-100`
const TitleBox = styled('div')`dib v-mid pa0 w-100 w-auto-ns`
const HeaderImg = styled('img')`v-mid mh0-ns dib-ns db center ph0 w4`
const TitleLink = styled(Link)`no-underline black`

class App extends Component {
  render() {
    return (
      <div>
        <Header>
          <SubHeader>
            <Link to="/"><HeaderImg src="/img/dots.png" alt="Nat? Nat. Nat!"></HeaderImg></Link>
            <TitleBox>
              <TitleLink to="/"><Title>Nat? Nat. Nat!</Title></TitleLink>
            </TitleBox>
          </SubHeader>
        </Header>

        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default App;
