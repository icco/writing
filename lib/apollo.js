import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuth0 } from "@auth0/auth0-react";

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

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

  const client = new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: ApolloLink.from([authLink, new HttpLink({ uri: GRAPHQL_ORIGIN })]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
