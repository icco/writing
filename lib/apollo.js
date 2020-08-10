import { useMemo, useEffect, useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuth0 } from "@auth0/auth0-react";

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

export function createApolloClient(initialState = null, bearerToken = "") {
  const httpLink = new HttpLink({ uri: GRAPHQL_ORIGIN });

  const authLink = setContext((_, { headers, ...rest }) => {
    if (!bearerToken) return { headers, ...rest };

    return {
      ...rest,
      headers: {
        ...headers,
        authorization: `Bearer ${bearerToken}`,
      },
    };
  });

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
}

export function initializeApollo(initialState = null, bearerToken = "") {
  const apolloClient = createApolloClient(initialState, bearerToken);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    apolloClient.cache.restore(initialState);
  }

  return apolloClient;
}

export function useApollo(initialState) {
    const { isAuthenticated, getTokenSilently } = useAuth0();
    const [bearerToken, setBearerToken] = useState("");
    useEffect(() => {
      const getToken = async () => {
        const token = isAuthenticated ? await getTokenSilently() : "";
        setBearerToken(token);
      };
      getToken();
    }, [getTokenSilently, isAuthenticated]);

  const store = useMemo(() => {
    return initializeApollo(initialState, bearerToken);
  }, [initialState, bearerToken]);
  return store;
}
