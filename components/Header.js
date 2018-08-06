import Link from "next/link";
import { withRouter } from "next/router";
import Logo from "./Logo";

const Header = ({ router: { pathname } }) => (
  <header className="mv5 center mw6">
    <Link href="/">
      <a className="link dark-gray dim">
        <Logo />
        <h1 className="tc">Nat? Nat. Nat!</h1>
      </a>
    </Link>
  </header>
);

export default withRouter(Header);
