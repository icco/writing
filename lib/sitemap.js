import sitemap from "sitemap";
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
  let urls = [];
  let postIds = await mostPosts();
  postIds.forEach(function(x) {
    urls.push({ url: `/post/${x.id}` });
  });

  let tags = await allTags();
  tags.forEach(function(t) {
    urls.push({ url: `/tag/${t}` });
  });

  urls.push({ url: "/" });
  return sitemap.createSitemap({
    hostname: "https://writing.natwelch.com",
    cacheTime: 6000000, // 600 sec - cache purge period
    urls,
  });
}
