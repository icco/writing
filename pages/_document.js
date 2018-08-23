import Document, { Head, Main, NextScript } from "next/document";
import { getUserFromServerCookie, getUserFromLocalCookie } from "../lib/auth";
import Router from "next/router";

export default class WritingDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const loggedUser = process.browser
      ? getUserFromLocalCookie()
      : getUserFromServerCookie(ctx.req);
    return {
      ...initialProps,
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
      <html lang="en">
        <Head>
          <link rel="stylesheet" href="/_next/static/style.css" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
            key="viewport"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
