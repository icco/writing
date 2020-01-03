import React from "react";
import Router from "next/router";

import * as fathom from "../lib/fathom";

Router.onRouteChangeComplete = url => {
  fathom.pageview(url);
};

function App({ children }) {
  return <main>{children}</main>;
}

export default App;
