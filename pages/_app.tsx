// Can not be done in _document.js
import "../style.css"

import { Auth0Provider } from "@auth0/auth0-react"
import { AuthorizedApolloProvider } from "lib/apollo"
import Head from "next/head"

function Writing({ Component, pageProps }) {
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
      <Auth0Provider
        domain={process.env.AUTH0_DOMAIN}
        audience={"https://natwelch.com"}
        clientId={process.env.AUTH0_CLIENT_ID}
        redirectUri={process.env.DOMAIN}
        useRefreshTokens={true}
        scope={"role,profile"}
      >
        <AuthorizedApolloProvider>
          <Component {...pageProps} />
        </AuthorizedApolloProvider>
      </Auth0Provider>
    </>
  )
}

// Will be called once for every metric that has to be reported.
export function reportWebVitals(metric: any) {
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
