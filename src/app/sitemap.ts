import { MetadataRoute } from "next"

import { allTags } from "@/components/Tag"

import { allPosts } from "contentlayer/generated"

export default function sitemap(): MetadataRoute.Sitemap {
  const domain = process.env.DOMAIN || "http://localhost:8080"

  // Get all published posts (excluding drafts)
  const posts = allPosts
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${domain}${post.permalink}`,
      lastModified: new Date(post.datetime),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

  // Get all tag pages
  const tags = allTags().map((tag) => ({
    url: `${domain}/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }))

  // Static pages
  const staticPages = [
    {
      url: domain,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${domain}/feed.rss`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.3,
    },
    {
      url: `${domain}/feed.atom`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.3,
    },
  ]

  return [...staticPages, ...posts, ...tags]
}
