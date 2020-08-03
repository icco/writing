import React, { useEffect, useState } from "react";
import fetch from "isomorphic-unfetch";
import {
  ApolloLink,
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { RetryLink } from "@apollo/client/link/retry";
import { createPersistedQueryLink } from "apollo-link-persisted-queries";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { concatPagination } from "@apollo/client/utilities";

import { logger } from "./logger";

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 */
export function createApolloClient(initialState = {}) {
  const { isAuthenticated, getTokenSilently } = useAuth0({
    audience: "https://natwelch.com",
  });
  const [bearerToken, setBearerToken] = useState("");

  useEffect(() => {
    const getToken = async () => {
      const token = isAuthenticated ? await getTokenSilently() : "";
      setBearerToken(token)
    };
    getToken()
  }, [getTokenSilently, isAuthenticated]);

  const httpLink = new HttpLink({ uri: GRAPHQL_ORIGIN });

  const retryLink = new RetryLink();

  const aptLink = createPersistedQueryLink({
    useGETForHashedQueries: false,
  });

  const errorLink = onError(
    ({ operation, response, graphQLErrors, networkError }) => {
      let data = {
        operation,
        response,
      };

      if (graphQLErrors) {
        graphQLErrors.forEach((err) => {
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

  const authLink = setContext((_, { headers, ...rest }) => {
    if (!bearerToken) {
      return { headers, ...rest }
    }

    // return the headers to the context so httpLink can read them
    return {
      ...rest,
      headers: {
        ...headers,
        authorization: `Bearer ${bearerToken}`,
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

  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  return new ApolloClient({
    ssrMode: typeof window === "undefined", // Disables forceFetch on the server (so queries are only run once)
    link,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            allPosts: concatPagination(),
          },
        },
      },
    }),
  });
}
