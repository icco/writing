import Router from "next/router";
import Head from "next/head";

// https://github.com/vercel/next.js/blob/canary/examples/with-apollo/pages/_app.js
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../lib/apollo";

// https://auth0.com/docs/libraries/auth0-react
import { Auth0Provider } from "@auth0/auth0-react";

// Can not be done in _document.js
import "../style.css";

/**
 * Where to send the user after they have signed in.
 */
const onRedirectCallback = (appState) => {
  if (appState && appState.returnTo) {
    Router.push({
      pathname: appState.returnTo.pathname,
      query: appState.returnTo.query,
    });
  }
};

/**
 * When it hasn't been possible to retrieve a new access token.
 * @param {Error} err
 * @param {AccessTokenRequestOptions} options
 */
const onAccessTokenError = (err, options) => {
  console.error("Failed to retrieve access token: ", err);
};

/**
 * When signing in fails for some reason, we want to show it here.
 * @param {Error} err
 */
const onLoginError = (err) => {
  Router.push({
    pathname: "/oops",
    query: {
      message: err.error_description || err.message,
    },
  });
};

/**
 * When redirecting to the login page you'll end up in this state where the login page is still loading.
 * You can render a message to show that the user is being redirected.
 */
const onRedirecting = () => {
  return (
    <div className="center mv4 w5">
      <h1>Signing you in</h1>
      <p>In order to access this page you will need to sign in.</p>
      <p>Please wait while we redirect you to the login page...</p>
    </div>
  );
};

function Writing({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps.initialApolloState);

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
        onLoginError={onLoginError}
        onAccessTokenError={onAccessTokenError}
        onRedirecting={onRedirecting}
        onRedirectCallback={onRedirectCallback}
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
  console.log(metric)
}

export default Writing;
