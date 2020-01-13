import InfiniteScroll from "react-infinite-scroller";
import gql from "graphql-tag";
import { ErrorMessage, Loading } from "@icco/react-common";
import { NetworkStatus } from "apollo-client";
import { useQuery } from "@apollo/react-hooks";

import PostResult from "./PostResult";

export const PER_PAGE = 20;

export const allPosts = gql`
  query posts($offset: Int!, $perpage: Int!) {
    posts(input: { limit: $perpage, offset: $offset }) {
      id
      title
      datetime
      tags
    }
  }
`;

export const allPostsQueryVars = {
  offset: 0,
  perpage: PER_PAGE,
};

let hasMore = true;

export default function PostList() {
  const { loading, error, data, fetchMore, networkStatus } = useQuery(
    allPosts,
    {
      variables: allPostsQueryVars,
      // Setting this value to true will make the component rerender when
      // the "networkStatus" changes, so we are able to know if it is fetching
      // more data
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
        if (fetchMoreResult.posts.length <= 0) {
          hasMore = false;
          return previousResult;
        }
        return Object.assign({}, previousResult, {
          // Append the new posts results to the old one
          posts: [...previousResult.posts, ...fetchMoreResult.posts],
        });
      },
    });
  };

  if (error) return <ErrorMessage message="Error loading posts." />;
  if (loading && !loadingMorePosts) return <Loading key={0} />;

  const { posts } = data;

  return (
    <section className="mw8 center">
      <InfiniteScroll
        threshold={500}
        loadMore={loadMorePosts}
        hasMore={hasMore}
        loader={<Loading key={0} />}
      >
        <ul className="list pl0" key="ul">
          {posts.map(post => (
            <PostResult post={post} key={post.id} />
          ))}
        </ul>
      </InfiniteScroll>
    </section>
  );
}
