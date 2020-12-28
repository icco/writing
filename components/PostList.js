import InfiniteScroll from "react-infinite-scroller";
import Link from "next/link";
import { ErrorMessage, Loading } from "@icco/react-common";
import { gql, useQuery } from "@apollo/client";

import Datetime from "components/Datetime";

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
  const { loading, error, data, fetchMore } = useQuery(allPosts, {
    variables: allPostsQueryVars,
  });

  const loadMorePosts = (page) => {
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

  if (error)
    return <ErrorMessage error={error} message="Error loading posts." />;
  if (loading) return <Loading key={0} />;

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
          {posts.map((post) => (
            <li className="mb5 ml4 mr3" key={"post-list-" + post.id}>
              <div className="f6 db pb1 gray">
                <span className="dbi mr3">#{post.id}</span>
                <Datetime>{post.datetime}</Datetime>
                <span className="dbi ml3">
                  {post.tags.map((tag, i) => (
                    <Link key={i} href={`/tag/${tag}`}>
                      <a className="mh1 link gray dim">#{tag}</a>
                    </Link>
                  ))}
                </span>
              </div>
              <Link href={`/post/${post.id}`}>
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
