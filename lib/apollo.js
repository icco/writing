import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { setContext } from "@apollo/client/link/context";
import { useMemo } from "react";

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

let apolloClient;

export const AuthorizedApolloProvider = ({ children }) => {
  const { getAccessTokenSilently } = useAuth0();
  const authLink = setContext(async (_, { headers, ...context }) => {
    const token = await getAccessTokenSilently();
    if (typeof Storage !== "undefined") {
      localStorage.setItem("token", token);
    }

    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...context,
    };
  });

  apolloClient = new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: ApolloLink.from([authLink, new HttpLink({ uri: GRAPHQL_ORIGIN })]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};

export function initializeApollo(initialState = null) {
  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    apolloClient.cache.restore(initialState);
  }

  return apolloClient;
}

export function useApollo(initialState) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}
