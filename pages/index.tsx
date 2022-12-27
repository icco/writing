import { gql } from "@apollo/client"
import App from "components/App"
import Footer from "components/Footer"
import Header from "components/Header"
import { PostType } from "components/Post"
import PostList from "components/PostList"
import { client } from "lib/simple"
import Head from "next/head"

const Index = ({
  posts,
}: {
  posts: Pick<PostType, "id" | "datetime" | "tags" | "title">[]
}) => {
  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat!</title>
        <meta
          name="Description"
          content="Nat Welch's blog about life and software."
        />
      </Head>
      <Header />
      <PostList posts={posts} />
      <Footer />
    </App>
  )
}

export async function getStaticProps() {
  const result = await client().query({
    query: gql`
      query posts($offset: Int!, $perpage: Int!) {
        posts(input: { limit: $perpage, offset: $offset }) {
          id
          title
          datetime
          tags
        }
      }
    `,
    variables: {
      offset: 0,
      perpage: 25,
    },
  })

  const posts = result.data.posts
  return { props: { posts } }
}

export default Index
