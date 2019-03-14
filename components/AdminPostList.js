import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";
import Link from "next/link";
import Loading from "./Loading";
import InfiniteScroll from "react-infinite-scroller";

const PER_PAGE = 20;

function AdminPostList({ data: { error, posts, loadMore } }) {
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
                  href={`/admin/post?id=${post.id}`}
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
    posts(input: {limit: $perpage, offset: $offset}) {
      id
      title
      datetime
      tags
    }
  }
`;

// The `graphql` wrapper executes a GraphQL query and makes the results
// available on the `data` prop of the wrapped component (PostList)
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
})(AdminPostList);
