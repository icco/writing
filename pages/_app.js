import Router from "next/router";
import Head from "next/head";

// https://github.com/vercel/next.js/blob/canary/examples/with-apollo/pages/_app.js
// https://dev.to/martinrojas/apollo-client-graphql-and-auth0-a-complete-implementation-19oc
import { AuthorizedApolloProvider } from "../lib/apollo";

// https://auth0.com/docs/libraries/auth0-react
import { Auth0Provider } from "@auth0/auth0-react";

// Can not be done in _document.js
import "../style.css";

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
  );
}

// Will be called once for every metric that has to be reported.
export function reportWebVitals(metric) {
  // These metrics can be sent to any analytics service
  console.log(metric);
}

export default Writing;
