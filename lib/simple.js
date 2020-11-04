import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

export function client() {
  logger.info(GRAPHQL_ORIGIN);
  return new ApolloClient({
    ssrMode: true,
    link: new HttpLink({ uri: GRAPHQL_ORIGIN }),
    cache: new InMemoryCache(),
  });
}
