import Router from "next/router";
import Head from "next/head";

// https://github.com/vercel/next.js/blob/canary/examples/with-apollo/pages/_app.js
import { ApolloProvider } from '@apollo/client'
import { useApollo } from "../lib/apollo";

// https://auth0.com/docs/libraries/auth0-react
import { Auth0Provider } from "@auth0/auth0-react";

// Can not be done in _document.js
import "../style.css";

function Writing({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps.initialApolloState)
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
      >
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
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
