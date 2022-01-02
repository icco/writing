import { Feed } from "feed";
import { md } from "lib/markdown";
import { DateTime } from "luxon"

const GRAPHQL_ORIGIN =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

async function recentPosts() {
  try {
    let resp = await fetch(GRAPHQL_ORIGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify({
        query: `
        query recentPosts {
          posts(input: { limit: 20, offset: 0 }) {
            id
            title
            datetime
            summary
          }
        }
      `,
      }),
    });
    let rj = await resp.json();
    if (rj.errors) {
      rj.errors.forEach((e) => {
        console.error(e.message);
      });
      return [];
    }

    return rj.data.posts;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function generateFeed() {
  let feed = new Feed({
    id: "NatNatNat",
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
    copyright: DateTime.now().ISODate(),
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
    console.error(err);
  }

  return feed;
}
