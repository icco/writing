import Datetime from "components/Datetime"
import Head from "next/head"
import Link from "next/link"

export default function Tag({ id, posts }) {
  return (
    <section className="mw8 center">
      <Head>
        <title>Nat? Nat. Nat! | tag &quot;{id}&quot;</title>
      </Head>

      <h1 className="ma4">Posts with tag &quot;{id}&quot;</h1>

      <ul className="list pl0">
        {posts.map((post) => (
          <li className="mb5 ml4 mr3" key={post.id}>
            <div className="f6 db pb1 gray">
              <span className="mr3">#{post.id}</span>
              <Datetime>{post.datetime}</Datetime>
            </div>
            <Link
              href={`/post/${post.id}`}
              className="header db f3 f1-ns link dark-gray dim"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
