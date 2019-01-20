import Link from "next/link";
import { withRouter } from "next/router";
import Logo from "./Logo";

const Header = ({ isAuthenticated, loggedInUser, router: { pathname } }) => {
  let nav = (
    <Link key="/auth/sign-in" href="/auth/sign-in">
      <a classname="f6 link dib dim mr3 black mr4-ns" href="/auth/sign-in">
        sign in
      </a>
    </Link>
  );

  if (isAuthenticated) {
    nav = (
      <Link key="/auth/sign-in" href="/auth/sign-in">
        <a classname="f6 link dib dim mr3 black mr4-ns" href="/auth/sign-in">
          {loggedInUser.name}
        </a>
      </Link>
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
};

export default withRouter(Header);
