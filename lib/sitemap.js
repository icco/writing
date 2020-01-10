import { SitemapStream } from 'sitemap'
import { createGzip } from 'zlib'
import gql from "graphql-tag";

import { createApolloClient } from "./apollo-create";
import { logger } from "./logger";

async function mostPosts() {
  try {
    const client = createApolloClient({});
    let res = await client.query({
      query: gql`
        query mostPosts {
          posts(input: { limit: 1000, offset: 0 }) {
            id
          }
        }
      `,
    });

    return res.data.posts;
  } catch (err) {
    logger.error(err);
    return [];
  }
}

async function allTags() {
  try {
    const client = createApolloClient({});
    let res = await client.query({
      query: gql`
        query tags {
          tags
        }
      `,
    });

    return res.data.tags;
  } catch (err) {
    logger.error(err);
    return [];
  }
}

export default async function generateSitemap() {
   const smStream = new SitemapStream({
    hostname: "https://writing.natwelch.com",
  })
    const pipeline = smStream.pipe(createGzip())
  smStream.write({ url: "/" });

  let postIds = await mostPosts();
  postIds.forEach(function(x) {
      smStream.write({ url: `/post/${x.id}` });
  });

  let tags = await allTags();
  tags.forEach(function(t) {
      smStream.write({ url: `/tag/${t}` });
  });
  smStream.end()

  return pipeline;
}
