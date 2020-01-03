import React from "react";
import Router from "next/router";

import * as fathom from "../lib/fathom";
import App from "../lib/with-apollo-client";

Router.onRouteChangeComplete = url => {
  fathom.pageview(url);
};

export default ({ children }) => <App>{children}</App>;
