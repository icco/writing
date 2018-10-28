import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import fetch from "isomorphic-unfetch";


// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

const { GRAPHQL_ORIGIN = "https://graphql.natwelch.com/graphql" } = process.env;

module.exports = {
  create: function(initialState) {
    return new ApolloClient({
      connectToDevTools: process.browser,
      ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
      link: ApolloLink.from([
        onError(({ graphQLErrors, networkError }) => {
          if (graphQLErrors)
            graphQLErrors.map(({ message, locations, path }) =>
              console.log(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
              )
            );
          if (networkError) console.log(`[Network error]: ${networkError}`);
        }),
        new HttpLink({
          uri: GRAPHQL_ORIGIN, // Server URL (must be absolute)
        }),
      ]),
      cache: new InMemoryCache().restore(initialState || {}),
    });
  },
};
