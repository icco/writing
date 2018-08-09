import Link from "next/link";
import { withRouter } from "next/router";
import Twitter from "../svgs/twitter.svg";
import Instagram from "../svgs/instagram.svg";
import Github from "../svgs/github.svg";

// SVG Icons are from https://simpleicons.org
const Header = ({ router: { pathname } }) => (
  <footer class="pv4 ph3 ph5-ns tc">
    <a
      class="link near-black hover-silver dib h2 w2 mr3"
      href="https://github.com/icco"
      title="Nat Welch GitHub"
    >
      <Github />
    </a>
    <a
      class="link hover-silver near-black dib h2 w2 mr3"
      href="https://instagram.com/probablynatwelch"
      title="Nat Welch Instagram"
    >
      <Instagram />
    </a>
    <a
      class="link hover-silver near-black dib h2 w2 mr3"
      href="https://twitter.com/icco"
      title="Nat Welch Twitter"
    >
      <Twitter />
    </a>
  </footer>
);

export default withRouter(Header);
