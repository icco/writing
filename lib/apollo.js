import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { setContext } from "@apollo/client/link/context";

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

export const AuthorizedApolloProvider = ({ children }) => {
  const { getAccessTokenSilently } = useAuth0();
  const authMiddleware = setContext(async (_, { headers, ...context }) => {
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

  const client = new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: ApolloLink.from([
      authMiddleware,
      new HttpLink({ uri: GRAPHQL_ORIGIN }),
    ]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

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
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}
