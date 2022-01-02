import {
  ApolloClient,
 ApolloClient,   ApolloLink,
  ApolloProvider,
  HttpLink,
HttpLink,   InMemoryCache,
InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { concatPagination } from '@apollo/client/utilities'
import { useAuth0 } from "@auth0/auth0-react";
import merge from 'deepmerge'
import isEqual from 'lodash/isEqual'
import { useMemo } from 'react'

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

export const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError)
    console.log(`[Network error ${GRAPHQL_ORIGIN}]: ${networkError}`);
});

export const AuthorizedApolloProvider = ({ children }) => {
  const { error, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const authLink = setContext(async (_, { headers, ...context }) => {
    if (typeof window === "undefined") {
      return { headers, ...context };
    }

    const token = isAuthenticated ? await getAccessTokenSilently() : "";
    if (typeof Storage !== "undefined") {
      localStorage.setItem("token", token);
    }
    if (error) {
      console.error("auth0 error", error);
      return { headers, ...context };
    }

    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...context,
    };
  });

  const client = new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: ApolloLink.from([
      errorLink,
      authLink,
      new HttpLink({ uri: GRAPHQL_ORIGIN }),
    ]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
