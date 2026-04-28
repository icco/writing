import { format } from "date-fns"
import { Feed } from "feed"
import { remark } from "remark"
import remarkGfm from "remark-gfm"
import remarkHtml from "remark-html"

import { Post } from "contentlayer/generated"

import { getHeaderImageAlt, toAbsoluteImageUrl } from "@/lib/absoluteImageUrl"

const FEED_SITE = "https://writing.natwelch.com"

const IMAGE_EXTENSIONS = new Set([
  "apng",
  "avif",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "webp",
])

const AUDIO_MIME_BY_EXT: Record<string, string> = {
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
  mp4: "audio/mp4",
  oga: "audio/ogg",
  ogg: "audio/ogg",
  opus: "audio/ogg; codecs=opus",
  wav: "audio/wav",
  webm: "audio/webm",
}

/**
 * The `feed` package (jpmonette/feed) has two relevant bugs that affect us:
 *   1. It does not escape `&` in attribute values when serializing XML, so any
 *      URL containing a query string with `&` (e.g. `?title=X&date=Y`) breaks
 *      well-formedness.
 *   2. It derives the enclosure MIME type from the URL pathname's extension
 *      (`image/${path.split(".").pop()}`), so an extensionless route like
 *      `/api/og?...` produces `type="image//api/og"` — also invalid and
 *      ignored by readers.
 *
 * Returning `false` here causes the caller to omit the `image` field entirely
 * for these URLs (Atom/RSS treat enclosures as optional and the post page
 * already exposes the OG image via meta tags / JSON-LD).
 */
function isFeedSafeImageUrl(url: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }
  if (parsed.search) return false
  const ext = parsed.pathname.split(".").pop()?.toLowerCase()
  return !!ext && IMAGE_EXTENSIONS.has(ext)
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
}

function escapeHtmlText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function audioMimeForUrl(url: string): string {
  const path = url.split("?")[0] ?? url
  const ext = path.split(".").pop()?.toLowerCase()
  return (ext && AUDIO_MIME_BY_EXT[ext]) || "audio/mpeg"
}

/** Resolve a single MDX-style attribute value (e.g. `src="/foo.wav"`). */
function getMdxStringAttr(tag: string, name: string): string | null {
  // Match name="..."; ignores expression-style attrs like `count={1}` on purpose.
  const re = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i")
  const m = tag.match(re)
  return m ? m[1] : null
}

/** Resolve an MDX array-literal attribute (e.g. `urls={["a","b"]}`). */
function getMdxArrayAttr(tag: string, name: string): string[] | null {
  const re = new RegExp(`${name}\\s*=\\s*\\{\\s*\\[([\\s\\S]*?)\\]\\s*\\}`, "i")
  const m = tag.match(re)
  if (!m) return null
  return Array.from(m[1].matchAll(/"((?:\\.|[^"\\])*)"/g)).map((entry) =>
    entry[1].replace(/\\"/g, '"').trim()
  )
}

function renderMusicEmbed(rawTag: string): string {
  const src = getMdxStringAttr(rawTag, "src") ?? ""
  const title = getMdxStringAttr(rawTag, "title")
  const caption = getMdxStringAttr(rawTag, "caption")
  const absoluteSrc = src.startsWith("/") ? `${FEED_SITE}${src}` : src
  const safeSrc = escapeHtmlAttribute(absoluteSrc)
  const safeType = escapeHtmlAttribute(audioMimeForUrl(absoluteSrc))
  const titleHtml = title
    ? `<p><strong>${escapeHtmlText(title)}</strong></p>\n`
    : ""
  const captionHtml = caption
    ? `<p><em>${escapeHtmlText(caption)}</em></p>\n`
    : ""
  return `${titleHtml}<p><audio controls preload="none" src="${safeSrc}" type="${safeType}"></audio></p>\n<p><a href="${safeSrc}">Download audio</a></p>\n${captionHtml}`
}

function renderPhotoGrid(rawTag: string): string {
  const urls = getMdxArrayAttr(rawTag, "urls") ?? []
  const alts = getMdxArrayAttr(rawTag, "alts") ?? []
  if (urls.length === 0) return ""
  const items = urls
    .map((url, i) => {
      const alt = alts[i] ?? `Photo ${i + 1}`
      const safeUrl = escapeHtmlAttribute(url)
      const safeAlt = escapeHtmlAttribute(alt)
      return `<p><a href="${safeUrl}"><img src="${safeUrl}" alt="${safeAlt}" loading="lazy" /></a></p>`
    })
    .join("\n")
  return `${items}\n`
}

/**
 * MDX bodies can include React components like `<MusicEmbed />` and
 * `<PhotoGrid />`. `remark-html` does not understand these and emits them
 * verbatim (lowercased, self-closing custom elements), which both produces
 * garbage in feed readers and trips the W3C feed validator's
 * `Trailing solidus not allowed on element …` warning. Replace them with
 * straightforward HTML before handing the body to remark.
 */
function expandMdxComponents(markdown: string): string {
  return markdown
    .replace(/<MusicEmbed\b[\s\S]*?\/>/g, (m) => renderMusicEmbed(m))
    .replace(/<PhotoGrid\b[\s\S]*?\/>/g, (m) => renderPhotoGrid(m))
}

/**
 * Make root-relative URLs absolute so the feed validator stops warning about
 * `content:encoded` containing relative references like `/post/772`.
 */
function absolutizeRelativeUrls(html: string): string {
  return html.replace(
    /(\b(?:href|src)\s*=\s*")\/(?!\/)([^"]*)/g,
    (_, prefix: string, rest: string) => `${prefix}${FEED_SITE}/${rest}`
  )
}

async function markdownToHtml(
  markdown: string,
  postUrl: string
): Promise<string> {
  const expanded = expandMdxComponents(markdown)
  const result = await remark()
    .use(remarkGfm)
    // Note: sanitize is disabled because:
    // 1. All content is version-controlled and written by the blog owner
    // 2. Posts contain intentional HTML (links, images, embeds)
    // 3. There is no user-generated content
    .use(remarkHtml, { sanitize: false })
    .process(expanded)
  const html = result.toString().replace(/href="#/g, `href="${postUrl}#`)
  return absolutizeRelativeUrls(html)
}

/**
 * When a post has a metadata header image, it is not in the MDX body, so feed HTML
 * would not show it. Prepend a figure so RSS/Atom `content:encoded` matches the site.
 * The `image` / enclosure URL remains for clients that use that only.
 */
function withFeedHeaderImageIfPresent(post: Post, contentHtml: string) {
  if (!post.header_image) {
    return contentHtml
  }
  const src = escapeHtmlAttribute(
    toAbsoluteImageUrl(post.social_image, FEED_SITE)
  )
  const alt = escapeHtmlAttribute(getHeaderImageAlt(post))
  return `<p><a href="${FEED_SITE}/post/${post.id}"><img src="${src}" width="800" height="500" alt="${alt}" loading="lazy" /></a></p>\n\n${contentHtml}`
}

function createFeedItem(post: Post, content: string) {
  const contentWithOptionalHero = withFeedHeaderImageIfPresent(post, content)
  const imageUrl = toAbsoluteImageUrl(post.social_image, FEED_SITE)
  return {
    id: `${FEED_SITE}/post/${post.id}`,
    title: post.title,
    link: `${FEED_SITE}/post/${post.id}`,
    date: new Date(post.datetime),
    description: post.summary || undefined,
    category: post.tags.map((t: string) => ({ name: t, term: t })),
    author: [
      {
        name: "Nat Welch",
        email: "nat@natwelch.com",
        link: "https://natwelch.com",
      },
    ],
    content: contentWithOptionalHero,
    ...(isFeedSafeImageUrl(imageUrl) ? { image: imageUrl } : {}),
  }
}

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

  for (const p of posts) {
    try {
      const postUrl = `https://writing.natwelch.com/post/${p.id}`
      const htmlContent = await markdownToHtml(p.body.raw, postUrl)
      feed.addItem(createFeedItem(p, htmlContent))
    } catch (err) {
      console.error(`Error processing post ${p.id}:`, err)
      // Add post with fallback content on error
      const fallbackContent = `<p>Error rendering post content. Please visit <a href="https://writing.natwelch.com/post/${p.id}">the full post</a> to read it.</p>`
      feed.addItem(createFeedItem(p, fallbackContent))
    }
  }

  return feed
}
