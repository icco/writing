import React from "react";
import PropTypes from "prop-types";

import Router from "next/router";

import { setToken, checkSecret, extractInfoFromHash } from "../../utils/auth";
import { finishAuthFlow } from "../../utils/lock";

export default class SignedIn extends React.Component {
  componentDidMount() {
    finishAuthFlow();
  }

  render() {
    return null;
  }
}
