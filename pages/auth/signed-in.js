import React from "react";
import PropTypes from "prop-types";
import Router from "next/router";

import { setToken } from "../../lib/auth";
import { parseHash } from "../../lib/auth0";

export default class SignedIn extends React.Component {
  componentDidMount() {
    parseHash((err, result) => {
      if (err) {
        console.error("Something happened with the Sign In request");
        return;
      }

      setToken(result.idToken, result.accessToken);
      Router.push("/");
    });
  }

  render() {
    return null;
  }
}
