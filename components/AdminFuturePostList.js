import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroller";
import { ErrorMessage, Loading } from "@icco/react-common";

const PER_PAGE = 20;

function AdminFuturePostList({ data: { error, posts, loadMore } }) {
  if (error) {
    return <ErrorMessage message="Error loading posts." />;
  }

  if (posts && posts.length) {
    return (
      <section className="mw8">
        <InfiniteScroll
          threshold={500}
          loadMore={loadMore}
          hasMore={true}
          loader={<Loading key={0} />}
        >
          <ul className="list pl0" key="admin-post-ul">
            {posts.map(post => (
              <li className="" key={"admin-post-" + post.id}>
                <span className="dbi mr3">#{post.id}</span>
                <Link
                  as={`/edit/${post.id}`}
                  href={`/admin/post/[pid]`}
                >
                  <a className="link dark-gray dim">{post.title}</a>
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
    futurePosts(input: { limit: $perpage, offset: $offset }) {
      id
      title
      datetime
      tags
    }
  }
`;

export default graphql(allPosts, {
  fetchPolicy: "network-only",
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
})(AdminFuturePostList);
