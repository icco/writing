import { gql } from "@apollo/client"
import App from "components/App"
import Footer from "components/Footer"
import Header from "components/Header"
import Post from "components/Post"
import { client } from "lib/simple"
import { GetStaticPaths, GetStaticProps } from "next"
import { serialize } from "next-mdx-remote/serialize"

const Page = ({ pid, post }): JSX.Element => {
  return (
    <App>
      <Header noLogo />
      <Post id={pid} post={post} />
      <Footer />
    </App>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { pid } = context.params
  const result = await client().query({
    query: gql`
      query post($id: ID!) {
        post(id: $id) {
          content
          modified
          title
        }
      }
    `,
    variables: {
      id: pid,
    },
  })

  const post = result.data.post
  post.html = await serialize(post.content)

  return {
    props: {
      pid,
      post,
    },
    revalidate: 600,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const result = await client().query({
    query: gql`
      query postIDs($offset: Int!, $perpage: Int!) {
        posts(input: { limit: $perpage, offset: $offset }) {
          id
        }
      }
    `,
    variables: {
      offset: 0,
      perpage: 50,
    },
  })

  return {
    paths: result["data"]["posts"].map(function (d) {
      return { params: { pid: d.id } }
    }),
    fallback: "blocking",
  }
}

export default Page
