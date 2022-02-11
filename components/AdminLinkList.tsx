import Datetime from "components/Datetime"

export default function AdminLinkList({ links }) {
  return (
    <section className="pa3 mw8 center">
      <ul className="list pl0" key="link-ul">
        {links.map((l) => (
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
                const text = `[${l.title} - ${l.description}](${l.uri})`
                navigator.clipboard.writeText(text)
              }}
            >
              {l.uri}
            </span>
            <blockquote>{l.description}</blockquote>
          </li>
        ))}
      </ul>
    </section>
  )
}
