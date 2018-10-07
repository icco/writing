import React from 'react'
import Router from 'next/router'
import * as gtag from "../lib/gtag";

Router.onRouteChangeComplete = url => {
  gtag.pageview(url)
}

export default ({ children }) => <main>{children}</main>;
