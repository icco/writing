import { gql, NetworkStatus, useQuery } from "@apollo/client"
import { ErrorMessage, Loading } from "@icco/react-common"
import { allPosts, PER_PAGE } from "components/PostList"
import Link from "next/link"

export default function AdminPostList({ posts, error }) {
  if (error) return <ErrorMessage message="Error loading posts." />

  return (
    <section className="mw8">
      <ul className="list pl0" key="admin-post-ul">
        {posts.map((post) => (
          <li className="" key={"admin-post-" + post.id}>
            <span className="dbi mr3">#{post.id}</span>
            <Link href={`/edit/${post.id}`}>
              <a className="link dark-gray dim">{post.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
