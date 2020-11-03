import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { useAuth0 } from "@auth0/auth0-react";

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );

  if (networkError) console.log(`[Network error ${GRAPHQL_ORIGIN}]: ${networkError}`);
});

export const AuthorizedApolloProvider = ({ children }) => {
  const { error, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const authLink = setContext(async (_, { headers, ...context }) => {
    if (typeof window === "undefined") {
      return { headers, ...context }
    }

    const token = isAuthenticated ? await getAccessTokenSilently() : "";
    if (typeof Storage !== "undefined") {
      localStorage.setItem("token", token);
    }
    if (error) {
      console.error("auth0 error", error)
      return { headers, ...context }
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
    link: ApolloLink.from([errorLink, authLink, new HttpLink({ uri: GRAPHQL_ORIGIN })]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
