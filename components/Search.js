import InfiniteScroll from "react-infinite-scroller";
import gql from "graphql-tag";
import { ErrorMessage, Loading } from "@icco/react-common";
import { NetworkStatus } from "apollo-client";
import { useQuery } from "@apollo/react-hooks";

import PostResult from "./PostResult";

export const PER_PAGE = 20;

export const searchQuery = gql`
  query search($query: String!, $offset: Int!, $perpage: Int!) {
    search(input: { limit: $perpage, offset: $offset }) {
      id
      title
      datetime
      tags
    }
  }
`;

let hasMore = true;

export default function Search({ query }) {
  const { loading, error, data, fetchMore, networkStatus } = useQuery(
    searchQuery,
    {
      variables: {
  query,
  offset: 0,
  perpage: PER_PAGE,
},
      notifyOnNetworkStatusChange: true,
    }
  );

  const loadingMorePosts = networkStatus === NetworkStatus.fetchMore;

  const loadMorePosts = page => {
    fetchMore({
      variables: {
        offset: page * PER_PAGE,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }
        if (fetchMoreResult.search.length <= 0) {
          hasMore = false;
          return previousResult;
        }
        return Object.assign({}, previousResult, {
          // Append the new posts results to the old one
          search: [...previousResult.search, ...fetchMoreResult.search],
        });
      },
    });
  };

  if (error) return <ErrorMessage message="Error loading posts." />;
  if (loading && !loadingMorePosts) return <Loading key={0} />;

  const { search } = data;

  return (
    <section className="mw8 center">
      <InfiniteScroll
        threshold={500}
        loadMore={loadMorePosts}
        hasMore={hasMore}
        loader={<Loading key={0} />}
      >
        <ul className="list pl0" key="ul">
          {search.map(post => (
            <PostResult post={post} />
          ))}
        </ul>
      </InfiniteScroll>
    </section>
  );
}
