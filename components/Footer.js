import Twitter from "../svgs/twitter.svg";
import Instagram from "../svgs/instagram.svg";
import Github from "../svgs/github.svg";
import ErrorMessage from "./ErrorMessage";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

// SVG Icons are from https://simpleicons.org
const Footer = params => {
  if (params.data.error) return <ErrorMessage message="Error loading stats." />;
  let stats = "";
  if (params.data.stats && params.data.stats.length) {
    stats = (
      <div className="cf">
        {params.data.stats.map(({ key, value }) => (
          <dl key={key} className="fl fn-l w-50 dib-l w-auto-l lh-title">
            <dd className="f6 fw4 ml0">{key}</dd>
            <dd className="f3 fw6 ml0">{value}</dd>
          </dl>
        ))}
      </div>
    );
  }

  return (
    <footer className="lh-title mv5 pv5 pl4 pr3 ph5-ns bt b--black-10">
      <h3 className="f6 tracked">
        Nat? Nat. Nat! is the blog of{" "}
        <a className="link" href="https://natwelch.com">Nat Welch</a>.
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

      {stats}

      <div className="mv2">
        Try out the <a className="link" href="https://brave.com/nat432">Brave Browser</a>.
      </div>

      <div className="mv2 rc-scout"></div>

      <script async defer src="https://www.recurse-scout.com/loader.js?t=1a20cf01214e4c5923ab6ebd6c0f8f18"></script>
    </footer>
  );
};

export const allStats = gql`
  query allStats {
    stats {
      key
      value
    }
  }
`;

export default graphql(allStats, {
  options: {}
})(Footer);
