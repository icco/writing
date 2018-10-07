import * as gtag from "../lib/gtag";

Router.events.on("routeChangeComplete", url => gtag.pageview(url));

export default ({ children }) => <main>{children}</main>;
