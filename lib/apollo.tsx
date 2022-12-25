import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error"

export const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__"

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql"

export const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    )

  if (networkError)
    console.log(`[Network error ${GRAPHQL_ORIGIN}]: ${networkError}`)
})

export const AuthorizedApolloProvider = ({ children }) => {
  const client = new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: ApolloLink.from([
      errorLink,
      new HttpLink({ uri: GRAPHQL_ORIGIN }),
    ]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
