import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import { RetryLink } from 'apollo-link-retry';
import { useAuth0 } from '@auth0/auth0-react';
import { setContext } from 'apollo-link-context';

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

export function createApolloClient() {
    const { getAccessTokenSilently } = useAuth0();
    const authMiddleware = setContext(async (_, { headers, ...context }) => {
        const token = await getAccessTokenSilently();
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('token', token);
        }

        return {
            headers: {
                ...headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...context,
        };
    });

    return new ApolloClient({
        link: ApolloLink.from([
            onError(({ graphQLErrors, networkError }) => {
                if (graphQLErrors) {
                    graphQLErrors.forEach(({ message, locations, path }) =>
                        console.error(
                            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
                        )
                    );
                }
                if (networkError) {
                    console.error(`[Network error]:`, networkError);
                }
            }),
            authMiddleware,
            new RetryLink(),
            new HttpLink({ uri: GRAPHQL_ORIGIN }),
        ]),
        cache: new InMemoryCache(),
        connectToDevTools: true,
        ssrMode: typeof window === "undefined",
    });

};

export const AuthorizedApolloProvider = ({ children }) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
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
