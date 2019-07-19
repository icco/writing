"use strict";

const fetch = require("isomorphic-unfetch");
const { ApolloClient } = require("apollo-client");
const { ApolloLink } = require("apollo-link");
const { InMemoryCache } = require("apollo-cache-inmemory");
const { RetryLink } = require("apollo-link-retry");
const { createHttpLink } = require("apollo-link-http");
const { createPersistedQueryLink } = require("apollo-link-persisted-queries");
const { onError } = require("apollo-link-error");
const { setContext } = require("apollo-link-context");

const { logger } = require("./logger.js");
const { getToken } = require("./auth.js");

let apolloClient = null;
const GRAPHQL_ORIGIN = process.env.GRAPHQL_ORIGIN;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

let exp = {};
exp["create"] = function(initialState, options) {
  const httpLink = createHttpLink({ uri: GRAPHQL_ORIGIN });

  const retryLink = new RetryLink();

  const aptLink = createPersistedQueryLink({
    useGETForHashedQueries: false,
  });

  const errorLink = onError(
    ({ operation, response, graphQLErrors, networkError, forward }) => {
      let data = {
        operation,
        response,
      };

      if (graphQLErrors) {
        graphQLErrors.forEach(err => {
          data["err"] = err;
          logger.error(data, `[GraphQL error]: ${err.message}`);
        });
      }

      if (networkError) {
        data["err"] = networkError;
        logger.error(data, `[Network error]: ${networkError}`);
      }
    }
  );

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = getToken();

    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  const link = ApolloLink.from([
    errorLink,
    retryLink,
    authLink,
    aptLink,
    httpLink,
  ]);

  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link,
    cache: new InMemoryCache().restore(initialState || {}),
  });
};

exp["initApollo"] = function(initialState, options) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return exp.create(initialState, options);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = exp.create(initialState, options);
  }

  return apolloClient;
};

module.exports = exp;
