import { gql } from "@apollo/client"
import { client } from "lib/simple"

function generateSiteMap(posts: [{ id: string }]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--We manually set the two URLs we know already-->
     <url>
       <loc>https://writing.natwelch.com</loc>
     </url>
     ${posts
       .map(({ id }) => {
         return `
       <url>
           <loc>https://writing.natwelch.com/post/${id}</loc>
       </url>
     `
       })
       .join("")}
   </urlset>
 `
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
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
      perpage: 1000,
    },
  })

  const sitemap = generateSiteMap(result.data.posts)

  res.setHeader("Content-Type", "text/xml")
  res.write(sitemap)
  res.end()

  return {
    props: {},
  }
}

export default SiteMap
