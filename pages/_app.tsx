// Can not be done in _document.js
import "../style.css"

import { MDXProvider } from "@mdx-js/react"
import { AuthorizedApolloProvider } from "lib/apollo"
import { AppProps, NextWebVitalsMetric } from "next/app"
import Head from "next/head"

const components = {}

function Writing({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="viewport-fit=cover" />
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
          key="viewport"
        />
        <link
          rel="webmention"
          href="https://webmention.io/natwelch.com/webmention"
        />
        <link rel="pingback" href="https://webmention.io/natwelch.com/xmlrpc" />
      </Head>
      <MDXProvider components={components}>
      <AuthorizedApolloProvider>
      <Component {...pageProps} />
      </AuthorizedApolloProvider>
      </MDXProvider>
    </>
  )
}

// Will be called once for every metric that has to be reported.
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const body = JSON.stringify(metric)
  const url = "https://reportd.natwelch.com/analytics/writing"

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body)
  } else {
    fetch(url, { body, method: "POST", keepalive: true })
  }
}

export default Writing
