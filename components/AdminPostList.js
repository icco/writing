import InfiniteScroll from "react-infinite-scroller";
import Link from "next/link";
import gql from "@apollo/client";
import { ErrorMessage, Loading } from "@icco/react-common";
import { NetworkStatus } from "@apollo/client";
import { useQuery } from "@apollo/client";

import { allPosts, PER_PAGE } from "./PostList";

export const allFuturePosts = gql`
  query future($offset: Int!, $perpage: Int!) {
    futurePosts(input: { limit: $perpage, offset: $offset }) {
      id
      title
    }
  }
`;

export const allDraftPosts = gql`
  query drafts($offset: Int!, $perpage: Int!) {
    drafts(input: { limit: $perpage, offset: $offset }) {
      id
      title
    }
  }
`;

let hasMore = true;

export default function AdminPostList({ type }) {
  let query = null;
  switch (type) {
    case "drafts":
      query = allDraftPosts;
      break;
    case "future":
      query = allFuturePosts;
      break;
    default:
      query = allPosts;
      break;
  }

  const { loading, error, data, fetchMore, networkStatus } = useQuery(query, {
    variables: {
      offset: 0,
      perpage: PER_PAGE,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
  });

  const loadingMorePosts = networkStatus === NetworkStatus.fetchMore;

  let adminPosts = [];

  const loadMorePosts = (page) => {
    fetchMore({
      variables: {
        offset: page * PER_PAGE,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }

        if (previousResult.posts) {
          if (fetchMoreResult.posts.length <= 0) {
            hasMore = false;
          }
          return Object.assign({}, previousResult, {
            posts: [...previousResult.posts, ...fetchMoreResult.posts],
          });
        }

        if (previousResult.drafts) {
          if (fetchMoreResult.drafts.length <= 0) {
            hasMore = false;
          }
          return Object.assign({}, previousResult, {
            drafts: [...previousResult.drafts, ...fetchMoreResult.drafts],
          });
        }

        if (previousResult.futurePosts) {
          if (fetchMoreResult.futurePosts.length <= 0) {
            hasMore = false;
          }
          return Object.assign({}, previousResult, {
            futurePosts: [
              ...previousResult.futurePosts,
              ...fetchMoreResult.futurePosts,
            ],
          });
        }

        return fetchMoreResult;
      },
    });
  };

  if (error) return <ErrorMessage message="Error loading posts." />;
  if (loading && !loadingMorePosts) return <Loading key={0} />;

  const { posts, futurePosts, drafts } = data;

  if (posts) {
    adminPosts = [...posts, ...adminPosts];
  }

  if (drafts) {
    adminPosts = [...drafts, ...adminPosts];
  }

  if (futurePosts) {
    adminPosts = [...futurePosts, ...adminPosts];
  }

  return (
    <section className="mw8">
      <InfiniteScroll
        threshold={500}
        loadMore={loadMorePosts}
        hasMore={hasMore}
        loader={<Loading key={0} />}
      >
        <ul className="list pl0" key="admin-post-ul">
          {adminPosts.map((post) => (
            <li className="" key={"admin-post-" + post.id}>
              <span className="dbi mr3">#{post.id}</span>
              <Link as={`/edit/${post.id}`} href={`/edit/[pid]`}>
                <a className="link dark-gray dim">{post.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </section>
  );
}
