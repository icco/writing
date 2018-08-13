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

    <div className="cf">
      <dl className="fl fn-l w-50 dib-l w-auto-l lh-title mr5-l">
        <dd className="f6 fw4 ml0">Closed Issues</dd>
        <dd className="f3 fw6 ml0">1,024</dd>
      </dl>
      <dl className="fl fn-l w-50 dib-l w-auto-l lh-title mr5-l">
        <dd className="f6 fw4 ml0">Open Issues</dd>
        <dd className="f3 fw6 ml0">993</dd>
      </dl>
      <dl className="fl fn-l w-50 dib-l w-auto-l lh-title mr5-l">
        <dd className="f6 fw4 ml0">Next Release</dd>
        <dd className="f3 fw6 ml0">10-22</dd>
      </dl>
      <dl className="fl fn-l w-50 dib-l w-auto-l lh-title mr5-l">
        <dd className="f6 fw4 ml0">Days Left</dd>
        <dd className="f3 fw6 ml0">4</dd>
      </dl>
      <dl className="fl fn-l w-50 dib-l w-auto-l lh-title mr5-l">
        <dd className="f6 fw4 ml0">Favorite Cat</dd>
        <dd className="f3 fw6 ml0">All of Them</dd>
      </dl>
      <dl className="fl fn-l w-50 dib-l w-auto-l lh-title">
        <dd className="f6 fw4 ml0">App Downloads</dd>
        <dd className="f3 fw6 ml0">1,200</dd>
      </dl>
    </div>
  </footer>
);

export default Header;
