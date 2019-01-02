const fetch = require("isomorphic-unfetch");
const { ApolloClient } = require("apollo-client");
const { InMemoryCache } = require("apollo-cache-inmemory");
const { createHttpLink } = require("apollo-link-http");

let apolloClient = null;

const { GRAPHQL_ORIGIN = "https://graphql.natwelch.com/graphql" } = process.env;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

let exp = {};
exp["create"] = function(initialState) {
  const link = createHttpLink({ uri: GRAPHQL_ORIGIN });
  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: link,
    cache: new InMemoryCache().restore(initialState || {}),
  });
};

exp["initApollo"] = function(initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return exp.create(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = exp.create(initialState);
  }

  return apolloClient;
};

module.exports = exp;
