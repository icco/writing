const apollo = require("apollo-boost");
const fetch = require("isomorphic-unfetch");

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

module.exports = {
  create: function(initialState) {
    // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
    return new apollo.ApolloClient({
      connectToDevTools: process.browser,
      ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
      link: new apollo.HttpLink({
        uri: "http://graphql.natwelch.com/graphql" // Server URL (must be absolute)
      }),
      cache: new apollo.InMemoryCache().restore(initialState || {})
    });
  }
}
