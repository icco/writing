import Link from "next/link";
import { withRouter } from "next/router";
import Logo from "./Logo";

const Header = ({ router: { pathname } }) => (
  <div>
    <nav class="flex justify-between">
      <div class="flex-grow pa3 flex items-center">
        <Link key="/auth/sign-in" href="/auth/sign-in">
          <a class="f6 link dib dim mr3 mr4-ns" href="/auth/sign-in">
            Sign In
          </a>
        </Link>
      </div>
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

export default withRouter(Header);
