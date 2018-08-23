import Document, { Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";
import { getUserFromServerCookie, getUserFromLocalCookie } from "../lib/auth";
import Router from "next/router";

export default class RootDocument extends Document {
  static getInitialProps(ctx) {
    const loggedUser = process.browser
      ? getUserFromLocalCookie()
      : getUserFromServerCookie(ctx.req);
    const sheet = new ServerStyleSheet();
    const page = ctx.renderPage(App => props =>
      sheet.collectStyles(<App {...props} />)
    );
    const styleTags = sheet.getStyleElement();
    return {
      ...page,
      styleTags,
      loggedUser,
      currentUrl: ctx.pathname,
      isAuthenticated: !!loggedUser
    };
  }

  logout = eve => {
    if (eve.key === "logout") {
      Router.push(`/?logout=${eve.newValue}`);
    }
  };

  componentDidMount() {
    window.addEventListener("storage", this.logout, false);
  }

  componentWillUnmount() {
    window.removeEventListener("storage", this.logout, false);
  }

  render() {
    return (
      <html>
        <Head>{this.props.styleTags}</Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
