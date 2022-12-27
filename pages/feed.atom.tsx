import { gql } from "@apollo/client"

import generateFeed from "lib/feed"
import { client } from "lib/simple"

const Feed = () => {
  return ""
}

export async function getServerSideProps(context) {
  const result = await client().query({
    query: gql`
      query posts($offset: Int!, $perpage: Int!) {
        posts(input: { limit: $perpage, offset: $offset }) {
          id
          summary
          datetime
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

  const ret = { props: {} }
  const res = context.res
  if (!res) {
    return ret
  }
  const feed = await generateFeed({ posts: result.data.posts })
  res.setHeader("Content-Type", "application/atom+xml")
  res.write(feed.atom1())
  res.end()

  return ret
}

export default Feed
