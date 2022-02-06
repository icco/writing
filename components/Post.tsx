import { useAuth0 } from "@auth0/auth0-react"
import { ErrorMessage } from "@icco/react-common"
import Datetime from "components/Datetime"
import PostCard from "components/PostCard"
import PostNav from "components/PostNav"
import Head from "next/head"
import Link from "next/link"

export default function Post({ id, post }) {
  const { error: authError, isAuthenticated } = useAuth0()

  if (!post) {
    const e = new Error()
    e.message = "Post not found"
    throw e
  }

  if (authError) {
    return <ErrorMessage error={authError} message="Unable to get page." />
  }

  let edit = <></>
  if (isAuthenticated) {
    edit = (
      <Link href={`/edit/${post.id}`}>
        <a className="mh1 link gray dim">edit</a>
      </Link>
    )
  }

  const title = `Nat? Nat. Nat! | #${post.id} ${post.title}`
  const url = post.uri

  return (
    <section className="mw8 center">
      <Head>
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Nat? Nat. Nat!" />
        <meta name="twitter:creator" content="@icco" />

        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta name="twitter:title" content={title} />

        <meta property="og:image" content={post.social_image} />
        <meta name="twitter:image" content={post.social_image} />

        <link rel="canonical" href={url} />
        <meta property="og:url" content={url} />
      </Head>

      <div className="mv4 mh3">
        <div className="f6 db pb1 gray">
          <span className="mr3">#{post.id}</span>
          <Datetime>{post.datetime}</Datetime>
          <span className="ml3">{edit}</span>
          <span className="ml3 red strong">{post.draft ? "draft" : ""}</span>
        </div>
        <Link href={`/post/${post.id}`}>
          <a className="header db f3 f1-ns link dark-gray dim">{post.title}</a>
        </Link>
      </div>

      <article className="mh3">{post.content}</article>

      <PostNav post={post} />

      <article className="mh3 dn db-ns">
        <h2>Related Posts</h2>
        <div className="flex items-start justify-between">
          <PostCard className="" post={post.related[0]} />
          <PostCard className="" post={post.related[1]} />
          <PostCard className="" post={post.related[2]} />
          <PostCard className="" post={post.related[3]} />
        </div>
      </article>
    </section>
  )
}
