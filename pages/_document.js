import Document, { Head, Main, NextScript } from "next/document";
import Router from "next/router";
import { NextAuth } from "next-auth/client";

export default class WritingDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const sessData = await NextAuth.init({ req: ctx.req });
    return {
      ...initialProps,
      currentUrl: ctx.pathname,
      session: sessData
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

  render(params) {
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
