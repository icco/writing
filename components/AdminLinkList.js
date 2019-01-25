import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";
import Link from "next/link";

function AdminLinkList({ data: { error, links } }) {
  if (error) {
    return <ErrorMessage message="Error loading links." />;
  }

  if (links && links.length) {
    return (
      <section className="pa3 mw8 center">
        <ul className="list pl0" key="link-ul">
          {links.map(l=> (
            <li className="" key={"link-" + l.id}>
              <span className="mr3">{l.created}</span>
              <Link href={l.url}>
                <a className="link dark-blue dim">{l.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return <div />;
}

export const SomeLinks = gql`
  query someLinks {
    links(limit: 50, offset: 0) {
      id
      uri
      title
      created
    }
  }
`;

export default graphql(SomeLinks, {})(AdminLinkList);
