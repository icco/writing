import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";
import Link from "next/link";

function PostList({ data: { loading, error, allPosts } }) {
  if (error) return <ErrorMessage message="Error loading posts." />;
  if (allPosts && allPosts.length) {
    return (
      <section className="mw8 center">
        <ul className="list pl0">
          {allPosts.map(post => (
            <li className="mb5 ml4 mr3" key={post.id}>
              <div className="f6 db pb1 light-gray">#{post.id} {post.datetime}</div>
              <Link
                prefetch
                as={`/post/${post.id}`}
                href={`/post?id=${post.id}`}
              >
                <a className="header db f3 f1-ns link dark-gray dim">{post.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return <div>Loading</div>;
}

export const allPosts = gql`
  query allPosts {
    allPosts {
      id
      title
      datetime
    }
  }
`;

// The `graphql` wrapper executes a GraphQL query and makes the results
// available on the `data` prop of the wrapped component (PostList)
export default graphql(allPosts, {
  options: {}
})(PostList);
