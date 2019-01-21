import Link from "next/link";
import { withRouter } from "next/router";
import Logo from "./Logo";

class Header extends React.Component {
  render() {
    let nav = (
      <Link key="/auth/sign-in" href="/auth/sign-in">
        <a className="f6 link dib dim mr3 black mr4-ns" href="/auth/sign-in">
          sign in
        </a>
      </Link>
    );

    if (!!this.props.loggedInUser) {
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

    return (
      <div>
        <nav className="flex justify-between">
          <div className="flex items-center pa3" />
          <div className="flex-grow pa3 flex items-center">{nav}</div>
        </nav>

        <header className="mv5 center mw6">
          <Link href="/">
            <a className="link dark-gray dim">
              <Logo />
              <h1 className="tc">Nat? Nat. Nat!</h1>
            </a>
          </Link>
        </header>
      </div>
    );
  }
}

export default withRouter(Header);
