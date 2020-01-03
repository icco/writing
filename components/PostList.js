import InfiniteScroll from "react-infinite-scroller";
import Link from "next/link";
import gql from "graphql-tag";
import { ErrorMessage, Loading } from "@icco/react-common";
import { NetworkStatus } from "apollo-client";
import { useQuery } from "@apollo/react-hooks";

import Datetime from "./Datetime";

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

  const loadMorePosts = () => {
    fetchMore({
      variables: {
        offset: posts.length,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
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
        hasMore={posts.length > 0}
        loader={<Loading key={0} />}
      >
        <ul className="list pl0" key="ul">
          {posts.map(post => (
            <li className="mb5 ml4 mr3" key={"post-list-" + post.id}>
              <div className="f6 db pb1 gray">
                <span className="dbi mr3">#{post.id}</span>
                <Datetime>{post.datetime}</Datetime>
                <span className="dbi ml3">
                  {post.tags.map((tag, i) => (
                    <Link key={i} as={`/tag/${tag}`} href={`/tag/[id]`}>
                      <a className="mh1 link gray dim">#{tag}</a>
                    </Link>
                  ))}
                </span>
              </div>
              <Link as={`/post/${post.id}`} href={`/post/[pid]`}>
                <a className="header db f3 f1-ns link dark-gray dim">
                  {post.title}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </section>
  );
}
