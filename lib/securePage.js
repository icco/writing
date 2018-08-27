import React from "react";
import PropTypes from "prop-types";
import NoSSR from "react-no-ssr";

import { tryReauth } from "./lock";
import { canAuthenticate } from "./auth";
import NotAuthorized from "../components/NotAuthorized";

const securePageHoc = Page =>
  class SecurePage extends React.Component {
    getInitialProps(ctx) {
      return Page.getInitialProps && Page.getInitialProps(ctx);
    }

    render(pr) {
      console.log(this.props);
      const { isAuthenticated } = this.props;
      return isAuthenticated ? (
        <Page {...this.props} />
      ) : (
        <React.Fragment>
          <NoSSR>
            <NotAuthorized />
          </NoSSR>
        </React.Fragment>
      );
    }
  };

export default Page => securePageHoc(Page);
