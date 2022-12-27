import Head from "next/head"

import PostList from "./PostList"

export default function Tag({ id, posts }) {
  return (
    <section className="mw8 center">
      <Head>
        <title>Nat? Nat. Nat! | tag &quot;{id}&quot;</title>
      </Head>

      <h1 className="ma4">Posts with tag &quot;{id}&quot;</h1>

      <PostList posts={posts} />
    </section>
  )
}
