import { gql } from "@apollo/client"
import App from "components/App"
import Footer from "components/Footer"
import Header from "components/Header"
import Tag from "components/Tag"
import { client } from "lib/simple"

const Page = ({ id, posts }) => {
  return (
    <App>
      <Header noLogo />
      <Tag id={id} posts={posts} />
      <Footer />
    </App>
  )
}

export async function getStaticProps(context) {
  const { id } = context.params
  const result = await client().query({
    query: gql`
      query postsByTag($id: String!) {
        postsByTag(id: $id) {
          id
          title
          datetime
          uri
        }
      }
    `,
    variables: { id },
  })

  return {
    props: {
      id,
      posts: result.data.postsByTag,
    },
    revalidate: 600,
  }
}

export async function getStaticPaths() {
  const result = await client().query({
    query: gql`
      query tags {
        tags
      }
    `,
  })

  return {
    paths: result.data.tags.map((t: string) => ({ params: { id: t } })),
    fallback: "blocking",
  }
}

export default Page
