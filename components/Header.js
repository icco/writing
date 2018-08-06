import Link from "next/link";
import { withRouter } from "next/router";
import Logo from "./Logo";

const Header = ({ router: { pathname } }) => (
  <header className="mb3">
    <Logo />
    <Link prefetch href="/">
      <a className={pathname === "/" ? "is-active" : ""}>Home</a>
    </Link>
    <Link prefetch href="/about">
      <a className={pathname === "/about" ? "is-active" : ""}>About</a>
    </Link>
  </header>
);

export default withRouter(Header);
