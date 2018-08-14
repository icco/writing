import Link from "next/link";
import Twitter from "../svgs/twitter.svg";
import Instagram from "../svgs/instagram.svg";
import Github from "../svgs/github.svg";

// SVG Icons are from https://simpleicons.org
const Header = params => (
  <footer className="lh-title mv5 pv5 pl4 pr3 ph5-ns bt b--black-10">
    <h3 className="f6 tracked">
      Nat? Nat. Nat! is the blog of <a href="https://natwelch.com">Nat Welch</a>
      .
    </h3>

    <div className="">
      <a
        className="link near-black hover-silver dib h1 w1 mr3"
        href="https://github.com/icco"
        title="Nat Welch GitHub"
      >
        <Github />
      </a>
      <a
        className="link hover-silver near-black dib h1 w1 mr3"
        href="https://instagram.com/probablynatwelch"
        title="Nat Welch Instagram"
      >
        <Instagram />
      </a>
      <a
        className="link hover-silver near-black dib h1 w1 mr3"
        href="https://twitter.com/icco"
        title="Nat Welch Twitter"
      >
        <Twitter />
      </a>
    </div>
  </footer>
);

export default Header;
