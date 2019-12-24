import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroller";
import { ErrorMessage, Loading } from "@icco/react-common";

import Datetime from "./Datetime";

const PER_PAGE = 20;

function PostList({ data: { error, posts, loadMore } }) {
  if (error) return <ErrorMessage message="Error loading posts." />;
  if (posts && posts.length) {
    return (
      <section className="mw8 center">
        <InfiniteScroll
          threshold={500}
          loadMore={loadMore}
          hasMore={true}
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

  return <div />;
}

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

export default graphql(allPosts, {
  options: {
    variables: {
      offset: 0,
      perpage: PER_PAGE,
    },
  },
  props: ({ data }) => ({
    data: {
      ...data,
      loadMore: page => {
        var offset = page * PER_PAGE;
        return data.fetchMore({
          variables: { offset, perpage: PER_PAGE },
          updateQuery: (previousResult = {}, { fetchMoreResult = {} }) => {
            var previousPosts = previousResult.posts;
            var currentPosts = fetchMoreResult.posts;
            return {
              posts: [...previousPosts, ...currentPosts],
            };
          },
        });
      },
    },
  }),
})(PostList);
