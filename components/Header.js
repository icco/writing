import Link from "next/link";
import { withRouter } from "next/router";

const Header = ({ router: { pathname } }) => (
  <header className="mb3">
    <Link prefetch href="/">
      <a className={pathname === "/" ? "is-active" : ""}>Home</a>
    </Link>
    <Link prefetch href="/about">
      <a className={pathname === "/about" ? "is-active" : ""}>About</a>
    </Link>
  </header>
);

export default withRouter(Header);
