const { ApolloClient } = require("apollo-client");
const { InMemoryCache } = require("apollo-cache-inmemory");
const { createPersistedQueryLink } = require("apollo-link-persisted-queries");
const { createHttpLink } = require("apollo-link-http");
const fetch = require("isomorphic-unfetch");

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

const { GRAPHQL_ORIGIN = "https://graphql.natwelch.com/graphql" } = process.env;

module.exports = {
  create: function(initialState) {
    const link = createPersistedQueryLink({
      useGETForHashedQueries: false,
      disable: err => {
        return err.networkError.statusCode > 200;
      },
    }).concat(createHttpLink({ uri: GRAPHQL_ORIGIN }));

    return new ApolloClient({
      connectToDevTools: process.browser,
      ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
      link: link,
      cache: new InMemoryCache().restore(initialState || {}),
    });
  },
};
