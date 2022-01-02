import Document, { Head, Html, Main, NextScript } from "next/document";

export default class WritingDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#000000" />

          <link
            rel="alternate"
            type="application/rss+xml"
            title="RSS Feed"
            href="/feed.rss"
          />
          <link
            rel="alternate"
            type="application/atom+xml"
            title="Atom Feed"
            href="/feed.atom"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
