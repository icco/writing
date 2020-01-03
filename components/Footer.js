import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ReactSVG from "react-svg";

const Footer = params => {
  return (
    <footer className="lh-title mv5 pv5 pl3 pr3 ph5-ns bt b--black-10">
      <h3 className="f6 tracked">
        Nat? Nat. Nat! is the blog of{" "}
        <a className="link blue dim" href="https://natwelch.com">
          Nat Welch
        </a>
        .
      </h3>

      <div className="mb2">
        <a
          className="link near-black hover-silver dib h1 w1 mr3"
          href="https://github.com/icco"
          title="Nat Welch GitHub"
        >
          <ReactSVG src="/svgs/github.svg" />
        </a>
        <a
          className="link hover-silver near-black dib h1 w1 mr3"
          href="https://instagram.com/probablynatwelch"
          title="Nat Welch Instagram"
        >
          <ReactSVG src="/svgs/instagram.svg" />
        </a>
        <a
          className="link hover-silver near-black dib h1 w1 mr3"
          href="https://twitter.com/icco"
          title="Nat Welch Twitter"
        >
          <ReactSVG src="/svgs/twitter.svg" />
        </a>
      </div>

      <div className="mv2 rc-scout" data-scout-rendered="true">
        <p className="rc-scout__text">
          <i className="rc-scout__logo" /> Want to become a better programmer?{" "}
          <a
            className="rc-scout__link"
            href="https://www.recurse.com/scout/click?t=1a20cf01214e4c5923ab6ebd6c0f8f18"
          >
            Join the Recurse Center!
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
