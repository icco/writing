import { Feed } from "feed";
import {
  gql,
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";

import { logger } from "./logger.js";
import md from "./markdown.js";

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

function client() {
  logger.info(GRAPHQL_ORIGIN);
  return new ApolloClient({
    ssrMode: true,
    link: new HttpLink({ uri: GRAPHQL_ORIGIN }),
    cache: new InMemoryCache(),
  });
}

async function recentPosts() {
  try {
    let res = await client().query({
      query: gql`
        query recentPosts {
          posts(input: { limit: 20, offset: 0 }) {
            id
            title
            datetime
            summary
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

export default async function generateFeed() {
  let feed = new Feed({
    title: "Nat? Nat. Nat!",
    favicon: "https://writing.natwelch.com/favicon.ico",
    description: "Nat Welch's blog about random stuff.",
    link: "https://writing.natwelch.com/",
    feedLinks: {
      atom: "https://writing.natwelch.com/feed.atom",
    },
    author: {
      name: "Nat Welch",
      email: "nat@natwelch.com",
      link: "https://natwelch.com",
    },
    language: "en",
  });

  try {
    let data = await recentPosts();

    data.forEach((p) => {
      feed.addItem({
        title: p.title,
        link: `https://writing.natwelch.com/post/${p.id}`,
        date: new Date(p.datetime),
        content: md.render(p.summary),
        author: [
          {
            name: "Nat Welch",
            email: "nat@natwelch.com",
            link: "https://natwelch.com",
          },
        ],
      });
    });
  } catch (err) {
    logger.error(err);
  }

  return feed;
}
