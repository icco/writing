import Document, { Head, Main, NextScript } from "next/document";
import { GA_TRACKING_ID } from "../lib/gtag";
import { TRACKING_ID } from "../lib/fathom";

export default class WritingDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
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
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            (function(f, a, t, h, o, m){
              a[h]=a[h]||function(){
                (a[h].q=a[h].q||[]).push(arguments)
              };
              o=f.createElement('script'),
              m=f.getElementsByTagName('script')[0];
              o.async=1; o.src=t; o.id='fathom-script';
              m.parentNode.insertBefore(o,m)
            })(document, window, '//a.natwelch.com/tracker.js', 'fathom');
            fathom('set', 'siteId', '${TRACKING_ID}');
            fathom('trackPageview');
          `,
            }}
          />
          <script
            async
            defer
            src="https://www.recurse-scout.com/loader.js?t=1a20cf01214e4c5923ab6ebd6c0f8f18"
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
