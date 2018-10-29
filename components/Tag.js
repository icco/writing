import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";
import Link from "next/link";
import Datetime from "./Datetime";
import Loading from "./Loading";
import InfiniteScroll from "react-infinite-scroller";

const PER_PAGE = 20;

const Tag = props => {
  const {
    data: { error, tag },
  } = props;

  if (error) return <ErrorMessage message="Tag not found." />;
  if (tag) {
    return (
      <section className="mw8 center">
        <Head>
          <title>
            Nat? Nat. Nat! | #{tag.id}
          </title>
        </Head>

        <InfiniteScroll
          threshold={500}
          loadMore={loadMore}
          hasMore={true}
          loader={<Loading />}
        >
          <ul className="list pl0">
            {posts.map(post => (
              <li className="mb5 ml4 mr3" key={post.id}>
                <div className="f6 db pb1 gray">
                  <span className="mr3">#{post.id}</span>
                  <Datetime>{post.datetime}</Datetime>
                </div>
                <Link as={`/post/${post.id}`} href={`/post?id=${post.id}`}>
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
};

export const getTag = gql`
  query getTag($id: ID!) {
    tag(id: $id) {
      id
      posts {
        id
        title
        datetime
      }
    }
  }
`;

export default graphql(getTag, {
  options: props => ({
    variables: {
      id: props.id,
    },
  }),
})(withRouter(Tag));
