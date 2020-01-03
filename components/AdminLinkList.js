import InfiniteScroll from "react-infinite-scroller";
import Link from "next/link";
import gql from "graphql-tag";
import { ErrorMessage, Loading } from "@icco/react-common";
import { NetworkStatus } from "apollo-client";
import { useQuery } from "@apollo/react-hooks";

import Datetime from "./Datetime";

export const linksQuery = gql`
  query links($offset: Int!, $perpage: Int!) {
    links(input: { limit: $perpage, offset: $offset }) {
      id
      uri
      title
      created
      description
    }
  }
`;

export const PER_PAGE = 50;

export default function AdminLinkList() {
  const { loading, error, data, fetchMore, networkStatus } = useQuery(
    linksQuery,
    {
      variables: {
        offset: 0,
        perpage: PER_PAGE,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const loadingMoreLinks = networkStatus === NetworkStatus.fetchMore;

  let hasMoreLinks = true;
  const loadMoreLinks = () => {
    fetchMore({
      variables: {
        offset: links.length,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          hasMoreLinks = false;
          return previousResult;
        }
        return Object.assign({}, previousResult, {
          // Append the new links results to the old one
          links: [...previousResult.links, ...fetchMoreResult.links],
        });
      },
    });
  };

  if (error) {
    return <ErrorMessage message="Error loading links." />;
  }
  if (loading && !loadingMoreLinks) return <Loading key={0} />;

  const { links } = data;

  return (
    <section className="pa3 mw8 center">
      <InfiniteScroll
        threshold={500}
        loadMore={loadMoreLinks}
        hasMore={hasMoreLinks}
        loader={<Loading key="link-loader" />}
      >
        <ul className="list pl0" key="link-ul">
          {links.map(l => (
            <li className="mv3" key={"link-" + l.id}>
              <span className="mr3">
                <Datetime>{l.created}</Datetime>
              </span>
              <a href={l.uri} className="link dark-blue dim">
                {l.title}
              </a>
              {" - "}
              <span
                className="gray link pointer dim"
                onClick={() => {
                  let text = `[${l.title} - ${l.description}](${l.uri})`;
                  navigator.clipboard.writeText(text);
                }}
              >
                {l.uri}
              </span>
              <blockquote>{l.description}</blockquote>
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </section>
  );
}
