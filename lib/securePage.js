import React from "react";
import PropTypes from "prop-types";
import NoSSR from "react-no-ssr";

import { tryReauth } from "./lock";
import { canAuthenticate } from "./auth";
import NotAuthorized from "../components/NotAuthorized";

class Reauthenticate extends React.Component {
  componentDidMount() {
    if (canAuthenticate()) {
      tryReauth();
    }
  }
  render() {
    return null;
  }
}

const securePageHoc = Page =>
  class SecurePage extends React.Component {
    getInitialProps(ctx) {
      return Page.getInitialProps && Page.getInitialProps(ctx);
    }

    render() {
      const { isAuthenticated } = this.props;
      return isAuthenticated ? (
        <Page {...this.props} />
      ) : (
        <React.Fragment>
          <NotAuthorized />
          <NoSSR>
            <Reauthenticate />
          </NoSSR>
        </React.Fragment>
      );
    }
  };

export default Page => securePageHoc(Page);
