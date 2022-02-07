import { Feed } from "feed"
import { MDXRemote } from "next-mdx-remote"

export default async function generateFeed({ posts, postHTML }) {
  const feed = new Feed({
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
    copyright: "2022",
  })

  try {
    posts.forEach((p) => {
      feed.addItem({
        title: p.title,
        link: `https://writing.natwelch.com/post/${p.id}`,
        date: new Date(p.datetime),
        content: MDXRemote(...postHTML[p.id]),
        author: [
          {
            name: "Nat Welch",
            email: "nat@natwelch.com",
            link: "https://natwelch.com",
          },
        ],
      })
    })
  } catch (err) {
    console.error(err)
  }

  return feed
}
