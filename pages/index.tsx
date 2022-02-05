import { gql } from "@apollo/client"
import App from "components/App"
import Footer from "components/Footer"
import Header from "components/Header"
import PostList from "components/PostList"
import { client } from "lib/simple"
import Head from "next/head"
import { serialize } from "next-mdx-remote/serialize"

const Index = ({ posts }) => {
  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat!</title>
        <meta
          name="Description"
          content="Nat Welch's blog about life and software."
        />
      </Head>
      <Header noLogo={undefined} />
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
          summary
          title
          uri
        }
      }
    `,
    variables: {
      offset: 0,
      perpage: 25,
    },
  })

  const posts = result.data.posts.map((p) => {
    p.html = serialize(p.content)
    return p
  })

  return { props: { posts } }
}

export default Index
