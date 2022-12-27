import { gql } from "@apollo/client"
import { GetStaticPaths, GetStaticProps } from "next"
import Error from "next/error"
import { MDXRemoteSerializeResult } from "next-mdx-remote"
import { serialize } from "next-mdx-remote/serialize"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

import App from "components/App"
import Footer from "components/Footer"
import Header from "components/Header"
import { Post, PostType } from "components/Post"
import remarkHashtags from "lib/hashtags"
import { client } from "lib/simple"

const Page = ({
  post,
  html,
  error,
}: {
  post: Partial<PostType>
  html: MDXRemoteSerializeResult
  error?: number
}): JSX.Element => {
  if (error) {
    return <Error statusCode={error} />
  }

  return (
    <App>
      <Header noLogo />
      <Post post={post} html={html} />
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
          id
          title
          content
          datetime
          draft
          social_image
          summary
          uri
          next {
            id
          }
          prev {
            id
          }
          related(input: { limit: 4 }) {
            id
            title
            summary
          }
          tags
        }
      }
    `,
    variables: {
      id: pid,
    },
  })

  const post = result.data.post
  if (!post) {
    return { props: { error: 404 } }
  }

  const { content } = post
  const html = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkHashtags],
      rehypePlugins: [rehypeSlug],
      // https://github.com/hashicorp/next-mdx-remote/issues/307#issuecomment-1363415249
      development: false,
    },
  })

  return {
    props: {
      post,
      html,
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
      perpage: 100,
    },
  })

  return {
    paths: result.data.posts.map((d: { id: string }) => ({
      params: { pid: d.id },
    })),
    fallback: "blocking",
  }
}

export default Page
