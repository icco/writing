import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ReactSVG from "react-svg";

// SVG Icons are from https://simpleicons.org
const Footer = params => {
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

      {stats}

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

Footer.getInitialProps = async function({ req, data }) {
  return {
    data: data,
  };
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
  options: {},
})(Footer);
