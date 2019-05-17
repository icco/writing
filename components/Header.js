import Link from "next/link";
import { withRouter } from "next/router";
import React from "react";

import Logo from "./Logo";

class Header extends React.Component {
  render() {
    let prefix = <></>;
    let nav = (
      <Link key="/auth/sign-in" href="/auth/sign-in">
        <a className="f6 link dib dim mr3 black mr4-ns" href="/auth/sign-in">
          sign in
        </a>
      </Link>
    );
    let head = (
      <>
        <header className="mv5 center mw6">
          <Link href="/">
            <a className="link dark-gray dim">
              <Logo className="center" />
              <h1 className="tc">Nat? Nat. Nat!</h1>
            </a>
          </Link>
        </header>
      </>
    );

    if (this.props.loggedInUser) {
      nav = (
        <>
          <Link key="/admin" href="/admin">
            <a className="f6 link dib dim mr3 black mr4-ns" href="/admin">
              {this.props.loggedInUser.role}
            </a>
          </Link>

          <Link key="/auth/sign-out" href="/auth/sign-out">
            <a
              className="f6 link dib dim mr3 black mr4-ns"
              href="/auth/sign-out"
            >
              Sign Out
            </a>
          </Link>
        </>
      );
    }

    if (this.props.noLogo) {
      head = <></>;
      prefix = (
        <Link href="/">
          <a className="link dark-gray dim">
            <Logo size={50} className="v-mid mh0-ns dib-ns center ph0 logo" />
          </a>
        </Link>
      );
    }

    return (
      <div>
        <nav className="flex justify-between ttc">
          <div className="flex items-center pa3">{prefix}</div>
          <div className="flex-grow pa3 flex items-center">{nav}</div>
        </nav>
        {head}
      </div>
    );
  }
}

export default withRouter(Header);
