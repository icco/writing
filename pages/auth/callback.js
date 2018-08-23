import React from "react";
import Router from "next/router";

import { setToken, checkSecret, extractInfoFromHash } from "../../lib/auth";
import { finishAuthFlow } from "../../lib/lock";

export default class Callback extends React.Component {
  componentDidMount() {
    finishAuthFlow();
  }

  render() {
    return null;
  }
}
