import { format } from "date-fns"
import { Feed } from "feed"
import { JSDOM } from "jsdom"
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
 * `content:encoded` containing relative references like `/post/772`. Also
 * promotes protocol-relative URLs (`//imgur.com/...`) to `https://`, which
 * the validator likewise treats as relative.
 */
function absolutizeRelativeUrls(html: string): string {
  return html
    .replace(
      /(\b(?:href|src)\s*=\s*")\/\/([^"]*)/g,
      (_, prefix: string, rest: string) => `${prefix}https://${rest}`
    )
    .replace(
      /(\b(?:href|src)\s*=\s*")\/([^"/][^"]*)/g,
      (_, prefix: string, rest: string) => `${prefix}${FEED_SITE}/${rest}`
    )
}

/**
 * Convert an iframe / object / embed `src` to a friendly external URL + label
 * so feed readers (which strip these tags for security) can still link out to
 * the original. Handles modern HTML5 embeds plus legacy Flash URLs from older
 * posts (YouTube `/v/`, Vimeo `moogaloop.swf`, Flickr `stewart.swf`, etc.).
 */
function describeEmbedUrl(src: string): { url: string; label: string } {
  let parsed: URL
  try {
    parsed = new URL(src, FEED_SITE)
  } catch {
    return { url: src, label: "View embedded content" }
  }
  const host = parsed.hostname.replace(/^www\./, "")
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    // Both modern `/embed/<id>` and legacy Flash `/v/<id>`.
    const m = parsed.pathname.match(/^\/(?:embed|v)\/([^/?#&]+)/)
    if (m) {
      return {
        url: `https://www.youtube.com/watch?v=${m[1]}`,
        label: "Watch on YouTube",
      }
    }
  }
  if (host === "player.vimeo.com" && parsed.pathname.startsWith("/video/")) {
    const id = parsed.pathname.slice("/video/".length).split("/")[0]
    if (id) {
      return { url: `https://vimeo.com/${id}`, label: "Watch on Vimeo" }
    }
  }
  if (host === "vimeo.com" && parsed.pathname.includes("moogaloop.swf")) {
    const id = parsed.searchParams.get("clip_id")
    if (id) {
      return { url: `https://vimeo.com/${id}`, label: "Watch on Vimeo" }
    }
  }
  if (host === "flickr.com" && parsed.pathname.startsWith("/apps/")) {
    const photoId = parsed.searchParams.get("photo_id")
    if (photoId) {
      return {
        url: `https://www.flickr.com/photos/${photoId}/`,
        label: "View on Flickr",
      }
    }
  }
  if (host === "hulu.com" && parsed.pathname.startsWith("/embed/")) {
    const id = parsed.pathname.slice("/embed/".length).split("/")[0]
    if (id) {
      return { url: `https://www.hulu.com/watch/${id}`, label: "Watch on Hulu" }
    }
  }
  return { url: parsed.toString(), label: `View embedded content (${host})` }
}

/**
 * Replace a block-level embed node (`<iframe>`, `<object>`, `<embed>`) with a
 * link to the original content. Markdown wraps these embeds in `<p>` already,
 * so naively producing another `<p>` would yield `<p><p>…</p></p>` (which the
 * validator flags as `Unexpected end tag (p). Ignored.`). To keep output
 * structurally valid:
 *   - If the embed is the sole child of a `<p>`, replace the parent `<p>`
 *     with a fresh `<p><a>…</a></p>`.
 *   - If it shares the `<p>` with siblings (e.g. a Vimeo Flash object next to
 *     a caption with `<br>` and extra `<a>` tags), replace the embed inline
 *     with just the anchor, leaving the surrounding paragraph intact.
 *   - Otherwise (no `<p>` parent) wrap the anchor in a new paragraph.
 */
function replaceEmbedNode(
  embed: Element,
  document: Document,
  src: string | null
): void {
  const parent = embed.parentElement
  const isOnlyChildOfP =
    parent?.tagName === "P" &&
    Array.from(parent.childNodes).every(
      (n) =>
        n === embed ||
        (n.nodeType === n.TEXT_NODE && !(n.textContent ?? "").trim())
    )

  let inner: Element
  if (src) {
    const { url, label } = describeEmbedUrl(src)
    const a = document.createElement("a")
    a.setAttribute("href", url)
    a.textContent = label
    inner = a
  } else {
    const span = document.createElement("span")
    span.textContent = "[embedded content]"
    inner = span
  }

  if (parent?.tagName === "P" && !isOnlyChildOfP) {
    embed.replaceWith(inner)
    return
  }
  const wrapper = document.createElement("p")
  wrapper.appendChild(inner)
  if (isOnlyChildOfP && parent) {
    parent.replaceWith(wrapper)
  } else {
    embed.replaceWith(wrapper)
  }
}

/** Find the most likely playable URL inside an `<object>` element. */
function objectEmbedSrc(object: Element): string | null {
  const data = object.getAttribute("data")
  if (data) return data
  const movieParam = object.querySelector('param[name="movie" i]')
  const movie = movieParam?.getAttribute("value")
  if (movie) return movie
  const childEmbed = object.querySelector("embed[src]")
  const embedSrc = childEmbed?.getAttribute("src")
  if (embedSrc) return embedSrc
  return null
}

/**
 * Replace iframes with link paragraphs and drop scripts. Also re-serializes
 * the body via jsdom so structurally invalid markup (e.g. `<p>` containing a
 * `<blockquote>` from twitter embeds) gets normalized into well-formed HTML
 * before being placed inside `<content type="html"><![CDATA[...]]>`. This
 * eliminates the W3C feed validator's `content should not contain script tag`
 * / `iframe tag` recommendations and the `Unexpected end tag (p)` warnings
 * those structures produced.
 */
function cleanFeedContentHtml(html: string): string {
  const dom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`)
  const { document } = dom.window

  for (const iframe of Array.from(document.querySelectorAll("iframe"))) {
    replaceEmbedNode(iframe, document, iframe.getAttribute("src"))
  }

  // Process `<object>` before standalone `<embed>` so the inner `<embed>` of
  // each object goes away with its parent and isn't replaced twice.
  for (const object of Array.from(document.querySelectorAll("object"))) {
    replaceEmbedNode(object, document, objectEmbedSrc(object))
  }
  for (const embed of Array.from(document.querySelectorAll("embed"))) {
    replaceEmbedNode(embed, document, embed.getAttribute("src"))
  }

  for (const script of Array.from(document.querySelectorAll("script"))) {
    script.remove()
  }

  // Anchors with empty or relative-looking `href` (broken markdown like
  // `[Foo]()` or a typo like `[Foo](some-handle)`) are reported as relative
  // URL references by the feed validator. Unwrap any such anchor so just the
  // link text remains.
  for (const anchor of Array.from(document.querySelectorAll("a[href]"))) {
    const href = anchor.getAttribute("href") ?? ""
    if (!isAbsoluteOrFragmentHref(href)) {
      while (anchor.firstChild) {
        anchor.parentNode?.insertBefore(anchor.firstChild, anchor)
      }
      anchor.remove()
    }
  }

  return document.body.innerHTML
}

function isAbsoluteOrFragmentHref(href: string): boolean {
  const trimmed = href.trim()
  if (!trimmed) return false
  if (trimmed.startsWith("#")) return true
  // Common absolute schemes — anything else is treated as relative by feed
  // readers even if it's syntactically a valid URI.
  return /^(?:[a-z][a-z0-9+.-]*:)/i.test(trimmed)
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
  const absolute = absolutizeRelativeUrls(html)
  return cleanFeedContentHtml(absolute)
}

/**
 * Post summaries are plain text but get embedded as HTML inside CDATA in the
 * feed. Bare ampersands (e.g. `D&D drama`) parse as broken named entity
 * references when the validator interprets the CDATA as HTML, producing the
 * `Named entity expected. Got none.` warning. Escape ampersands and angle
 * brackets so the summary is valid HTML.
 */
function escapeSummaryHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
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
    description: post.summary ? escapeSummaryHtml(post.summary) : undefined,
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
