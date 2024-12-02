import { format } from "date-fns"
import { Feed } from "feed"

import { Post } from "contentlayer/generated"

export default async function generateFeed(posts: Post[]) {
  const feed = new Feed({
    id: "https://writing.natwelch.com/",
    title: "Nat? Nat. Nat!",
    favicon: "https://writing.natwelch.com/favicon.ico",
    description: "Nat Welch's blog about random stuff.",
    link: "https://writing.natwelch.com/",
    feedLinks: {
      atom: "https://writing.natwelch.com/feed.atom",
      rss: "https://writing.natwelch.com/feed.rss",
    },
    author: {
      name: "Nat Welch",
      email: "nat@natwelch.com",
      link: "https://natwelch.com",
    },
    language: "en",
    copyright: `2011 - ${format(
      new Date(),
      "yyyy"
    )} Nat Welch. All rights reserved.`,
  })

  try {
    posts.forEach((p) => {
      feed.addItem({
        title: p.title,
        link: `https://writing.natwelch.com/post/${p.id}`,
        date: new Date(p.datetime),
        category: p.tags.map((t: string) => ({ name: t, term: t })),
        author: [
          {
            name: "Nat Welch",
            email: "nat@natwelch.com",
            link: "https://natwelch.com",
          },
        ],
        // Just raw markdown for now.
        content: p.body.raw,
      })
    })
  } catch (err) {
    console.error(err)
  }

  return feed
}
