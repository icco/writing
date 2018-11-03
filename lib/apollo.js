const fetch = require("isomorphic-unfetch");
const { ApolloClient } = require("apollo-client");
const { InMemoryCache } = require("apollo-cache-inmemory");
const { createHttpLink } = require("apollo-link-http");

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

const { GRAPHQL_ORIGIN = "https://graphql.natwelch.com/graphql" } = process.env;

module.exports = {
  create: function(initialState) {
    const link = createHttpLink({ uri: GRAPHQL_ORIGIN });
    return new ApolloClient({
      connectToDevTools: process.browser,
      ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
      link: link,
      cache: new apollo.InMemoryCache().restore(initialState || {}),
    });
  },
};
