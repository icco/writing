const sitemap = require("sitemap");
import { useRouter } from "next/router";
import gql from "graphql-tag";

async function generateSitemap(client) {
  let urls = [];
  let postIds = await mostPosts(client);
  postIds.forEach(function(x) {
    urls.push({ url: `/post/${x.id}` });
  });

  let tags = await allTags(client);
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

async function mostPosts(client) {
  try {
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

async function allTags(client) {
  try {
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

const Page = props => {
  return props["sitemap"]
}

Page.getStaticProps = async ctx => {
  return { sitemap: generateSitemap(ctx.apolloClient) }
}

export default Page;
