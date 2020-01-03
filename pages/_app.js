import { ApolloProvider } from "react-apollo";

import withApollo from "../lib/with-apollo-client";

function Writing({ Component, pageProps, apolloClient }) {
  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default withApollo(Writing);
