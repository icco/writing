import { graphql } from "react-apollo";
import gql from "graphql-tag";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroller";

import ErrorMessage from "./ErrorMessage";
import Datetime from "./Datetime";
import Loading from "./Loading";

function AdminLinkList({ data: { error, links } }) {
  if (error) {
    return <ErrorMessage message="Error loading links." />;
  }

  if (links && links.length) {
    return (
      <section className="pa3 mw8 center">
        <InfiniteScroll
          threshold={500}
          loadMore={loadMore}
          hasMore={true}
          loader={<Loading key="link-loader" />}
        >
        <ul className="list pl0" key="link-ul">
          {links.map(l => (
            <li className="mv3" key={"link-" + l.id}>
              <span className="mr3"><Datetime>{l.created}</Datetime></span>
              <Link href={l.uri}>
                <a className="link dark-blue dim">{l.title}</a>
              </Link>
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

  return <div />;
}

export const SomeLinks = gql`
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

const PER_PAGE = 50;

export default graphql(SomeLinks, {
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
            var previouslinks = previousResult.links;
            var currentlinks = fetchMoreResult.links;
            return {
              links: [...previouslinks, ...currentlinks],
            };
          },
        });
      },
    },
  }),
})(AdminLinkList);
