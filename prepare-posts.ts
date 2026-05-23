/**
 * Prepare blog posts for publishing: backfill summaries, promote leading
 * in-body images to front matter (`header_image` + `header_image_alt_text`),
 * and rewrite *all* remaining body images so they are served from
 * `icco.imgix.net`.
 *
 * Usage:
 *   pnpm prepare-posts
 *   pnpm prepare-posts 772
 *
 * When `header_image` is set but `header_image_alt_text` is empty, we still
 * run vision alt generation (so re-running a single post can fill in alt
 * after you already moved the image into front matter).
 *
 * Auth (in priority order):
 *   1. GEMINI_API_KEY environment variable
 *   2. gcloud ADC via Vertex AI (uses active gcloud project)
 *
 * Any image that isn't already on `icco.imgix.net` (header or body) is
 * downloaded and uploaded through photos.natwelch.com (POST multipart `photo`
 * to `PHOTOS_UPLOAD_URL`, default `https://photos.natwelch.com/api/upload`),
 * which returns JSON `{ success, files: [{ url: "https://icco.imgix.net/…" }] }`.
 * The original markdown URL is replaced with the returned imgix URL so every
 * downstream consumer (RSS, OG cards, the site itself) gets imgix-optimized
 * delivery.
 */

import * as fs from "fs"
import * as path from "path"
import { execFileSync } from "child_process"
import { GoogleGenAI } from "@google/genai"
import { remark } from "remark"
import stripMarkdown from "strip-markdown"
import matter from "gray-matter"

const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-3.1-pro-preview"
const POSTS_DIR = path.join(__dirname, "posts")

const ICCO_IMGIX_HOST = "icco.imgix.net"
const DEFAULT_PHOTOS_UPLOAD = "https://photos.natwelch.com/api/upload"
const MAX_IMPORT_IMAGE_BYTES = 200 * 1024 * 1024
/** Multimodal inline image limit; request smaller from imgix if over. */
const MAX_VISION_INLINE_BYTES = 4 * 1024 * 1024

type ExtractResult = {
  url: string
  /** Markdown alt, if any (used as hint for header_image_alt_text). */
  hintAlt: string
  stripped: string
}

function makeClient(): GoogleGenAI {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }

  let project: string | null = null
  try {
    project =
      execFileSync("gcloud", ["config", "get-value", "project"], {
        stdio: ["pipe", "pipe", "pipe"],
      })
        .toString()
        .trim() || null
  } catch {
    // ignore
  }

  if (!project) {
    console.error(
      "No auth available: set GEMINI_API_KEY or configure gcloud (`gcloud auth application-default login && gcloud config set project <project>`)"
    )
    process.exit(1)
  }

  return new GoogleGenAI({ vertexai: true, project, location: "us-central1" })
}

const ai = makeClient()

/** Fisher–Yates so a partial run touches a random spread of posts. */
function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
}

async function callGemini(prompt: string, maxOutputTokens = 2048): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens,
        // Thinking tokens count against maxOutputTokens and can't be disabled.
        thinkingConfig: { thinkingBudget: 1024 },
      },
    })
    return response.text?.trim() ?? ""
  } catch (err) {
    const msg = (err as Error).message ?? ""
    if (msg.includes("invalid_grant")) {
      console.error(
        "ADC credentials expired. Run: gcloud auth application-default login"
      )
      process.exit(1)
    }
    throw err
  }
}

/** Imgix-only sizing helper: mutate the URL in place if it's an imgix URL. */
function withImgixSize(href: string, width: number): string {
  try {
    const u = new URL(href)
    if (u.hostname !== ICCO_IMGIX_HOST) {
      return href
    }
    u.searchParams.set("w", String(width))
    u.searchParams.set("auto", "format,compress")
    return u.toString()
  } catch {
    return href
  }
}

async function fetchImageForVision(
  publicUrl: string
): Promise<{ data: string; mime: string } | null> {
  const tryUrl = (href: string) =>
    fetch(href, { headers: { Accept: "image/*" } })

  let r = await tryUrl(withImgixSize(publicUrl, 1280))
  if (!r.ok) {
    r = await tryUrl(publicUrl)
  }
  if (!r.ok) {
    console.error(`  Could not download image for vision alt: ${r.status}`)
    return null
  }

  let ab = await r.arrayBuffer()
  if (ab.byteLength > MAX_VISION_INLINE_BYTES && isIccoImgixUrl(publicUrl)) {
    const r2 = await tryUrl(withImgixSize(publicUrl, 768))
    if (r2.ok) {
      r = r2
      ab = await r2.arrayBuffer()
    }
  }
  if (ab.byteLength > MAX_VISION_INLINE_BYTES) {
    console.error(
      `  Image still too large for inline vision (~${(ab.byteLength / 1e6).toFixed(1)}MB); skip alt.`
    )
    return null
  }

  const ct = (r.headers.get("content-type") ?? "").split(";")[0]!.trim()
  const mime = ct.startsWith("image/") ? ct : "image/jpeg"
  return { data: Buffer.from(ab).toString("base64"), mime }
}

/**
 * One simple Gemini vision call. Logs raw model output and any block reason
 * so failures aren’t silent. Returns the model’s text exactly; cleanup happens
 * in `buildHeaderImageAltText`.
 */
async function describeImageWithGemini(
  image: { data: string; mime: string },
  userPrompt: string
): Promise<{ text: string; meta: string }> {
  try {
    const res = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        role: "user",
        parts: [
          { inlineData: { mimeType: image.mime, data: image.data } },
          { text: userPrompt },
        ],
      },
      config: {
        temperature: 0.2,
        // Thinking tokens count against maxOutputTokens and can't be disabled.
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 1024 },
      },
    })
    const text = res.text?.trim() ?? ""
    const c0 = res.candidates?.[0]
    const meta = JSON.stringify({
      finishReason: c0?.finishReason,
      finishMessage: c0?.finishMessage,
      blockReason: res.promptFeedback?.blockReason,
      blockMessage: res.promptFeedback?.blockReasonMessage,
      model: GEMINI_MODEL,
      bytes: image.data.length,
    })
    return { text, meta }
  } catch (err) {
    const msg = (err as Error).message ?? ""
    if (msg.includes("invalid_grant")) {
      console.error(
        "ADC credentials expired. Run: gcloud auth application-default login"
      )
      process.exit(1)
    }
    return { text: "", meta: `error: ${msg.slice(0, 400)}` }
  }
}

function isIccoImgixUrl(url: string): boolean {
  try {
    return new URL(url).hostname === ICCO_IMGIX_HOST
  } catch {
    return false
  }
}

/** image/<subtype> → ".<ext>" with a few common normalisations. */
const IMAGE_EXT_BY_SUBTYPE: Record<string, string> = {
  jpeg: ".jpg",
  pjpeg: ".jpg",
  jpg: ".jpg",
  png: ".png",
  gif: ".gif",
  webp: ".webp",
  "svg+xml": ".svg",
  heic: ".heic",
  heif: ".heic",
  bmp: ".bmp",
}

/**
 * Pick a file extension for a downloaded image. Trust `path.extname()` first,
 * then fall back to the response Content-Type, then `.jpg`.
 */
function pickImageExt(sourceUrl: string, contentType: string | null): string {
  let ext: string | undefined
  try {
    ext = path.extname(new URL(sourceUrl).pathname).toLowerCase() || undefined
  } catch {
    // fall through to content-type
  }
  if (ext) {
    return ext === ".jpeg" ? ".jpg" : ext
  }
  const subtype = contentType?.match(/^image\/([\w+-]+)/i)?.[1]?.toLowerCase()
  return (subtype && IMAGE_EXT_BY_SUBTYPE[subtype]) || ".jpg"
}

async function uploadSourceImageToPhotos(
  sourceUrl: string
): Promise<string> {
  const res = await fetch(sourceUrl, {
    redirect: "follow",
    headers: { Accept: "image/*,*/*" },
  })
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status} for ${sourceUrl}`)
  }
  const cl = res.headers.get("content-length")
  if (cl && Number.parseInt(cl, 10) > MAX_IMPORT_IMAGE_BYTES) {
    throw new Error("Image is too large to import (Content-Length).")
  }
  const ab = await res.arrayBuffer()
  if (ab.byteLength > MAX_IMPORT_IMAGE_BYTES) {
    throw new Error("Image is too large to import.")
  }
  const ct = res.headers.get("content-type")
  const ext = pickImageExt(sourceUrl, ct)
  const uploadBase =
    process.env.PHOTOS_UPLOAD_URL?.trim() || DEFAULT_PHOTOS_UPLOAD
  const name = `import${ext}`
  const file = new File(
    [new Uint8Array(ab)],
    name,
    { type: ct || "application/octet-stream" }
  )
  const form = new FormData()
  form.append("photo", file)

  const up = await fetch(uploadBase, { method: "POST", body: form })
  if (!up.ok) {
    const t = await up.text()
    throw new Error(
      `Photos upload error ${up.status}: ${t.slice(0, 500)}`
    )
  }
  const j = (await up.json()) as {
    success?: boolean
    files?: { path?: string; url: string }[]
  }
  const u = j.files?.[0]?.url
  if (!u) {
    throw new Error(
      "Upload response missing files[0].url. Deploy a photos app whose /api/upload returns { files: [{ url }]}."
    )
  }
  return normalizeImageUrl(u)
}

/**
 * `header_image` in this repo is always stored as `https://icco.imgix.net/…`
 * (except for anything already on that host). Other URLs are pushed through
 * photos.natwelch.com.
 */
async function ensureIccoHeaderImageUrl(
  sourceUrl: string
): Promise<string> {
  if (isIccoImgixUrl(sourceUrl)) {
    return normalizeImageUrl(sourceUrl)
  }
  console.log("  → Uploading via photos.natwelch.com → icco.imgix.net …")
  return uploadSourceImageToPhotos(sourceUrl)
}

/** Real imgix delivery hostnames (avoid loose substring matches on full URLs). */
function isImgixHostname(hostname: string): boolean {
  return hostname === ICCO_IMGIX_HOST || hostname.endsWith(".imgix.net")
}

function isFlickrHostname(host: string): boolean {
  const h = host.toLowerCase()
  return (
    h === "flickr.com" ||
    h.endsWith(".flickr.com") ||
    h === "staticflickr.com" ||
    h.endsWith(".staticflickr.com")
  )
}

function normalizeImageUrl(url: string): string {
  try {
    const u = new URL(url)
    if (isImgixHostname(u.hostname)) {
      u.searchParams.delete("w")
      u.searchParams.delete("h")
      u.searchParams.delete("fit")
      u.searchParams.delete("auto")
    }
    return u.toString()
  } catch {
    return url.trim()
  }
}

/**
 * Whether a URL (or path string) is probably an image. CodeQL: do not use
 * substring matches on the full string — parse with URL and test hostname
 * and pathname.
 */
function isLikelyImageUrl(s: string): boolean {
  const noQuery = s.split("?")[0]!
  if (/\.(jpe?g|png|gif|webp|svg|avif|bmp|heic)$/i.test(noQuery)) {
    return true
  }
  if (s.startsWith("http://") || s.startsWith("https://")) {
    let u: URL
    try {
      u = new URL(s)
    } catch {
      return false
    }
    const h = u.hostname.toLowerCase()
    if (isImgixHostname(h) || isFlickrHostname(h)) {
      return true
    }
    if (h === "storage.googleapis.com") {
      return /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(u.pathname)
    }
    return false
  }
  return false
}

/**
 * If the post starts with a lone image in common markdown/HTML/bare-URL
 * form, return its URL, optional markdown alt, and the body with that block
 * removed.
 */
function tryExtractLeadingImage(text: string): ExtractResult | null {
  if (!text.trim() || /^\s*```/.test(text)) return null

  // [![alt](inner)](outer) — e.g. linked hero card
  let m = text.match(
    /^\s*\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)(?:[ \t]*(?:\n|$)|\n*\n)/
  )
  if (m) {
    const url = normalizeImageUrl(m[3]!.trim())
    if (!isLikelyImageUrl(url)) return null
    return {
      url,
      hintAlt: (m[1] ?? "").trim(),
      stripped: text.slice(m[0]!.length).replace(/^\n+/, ""),
    }
  }

  // ![alt](url)
  m = text.match(
    /^\s*!\[([^\]]*)\]\(([^)]+)\)(?:[ \t]*(?:\n|$)|\n*\n)/
  )
  if (m) {
    const url = normalizeImageUrl(m[2]!.trim())
    if (!isLikelyImageUrl(url)) return null
    return {
      url,
      hintAlt: (m[1] ?? "").trim(),
      stripped: text.slice(m[0]!.length).replace(/^\n+/, ""),
    }
  }

  // <img src="...">
  m = text.match(
    /^\s*<img[^>]+?src=\s*["']([^"']+)["'][^>]*?>(?:[ \t]*(?:\n|$)|\n*\n)/is
  )
  if (m) {
    const url = normalizeImageUrl(m[1]!.trim())
    if (!isLikelyImageUrl(url)) return null
    return { url, hintAlt: "", stripped: text.slice(m[0]!.length).replace(/^\n+/, "") }
  }

  // Bare image URL: first line / block
  m = text.match(/^\s*(https?:\/\/\S+)(?:[ \t]*\n+|\s*$)/)
  if (m) {
    const line = m[1]!.trim()
    if (!isLikelyImageUrl(line)) return null
    return {
      url: normalizeImageUrl(line),
      hintAlt: "",
      stripped: text.slice(m[0]!.length).replace(/^\n+/, ""),
    }
  }

  return null
}

async function stripMd(content: string): Promise<string> {
  const file = await remark().use(stripMarkdown).process(content)
  return String(file).trim()
}

/**
 * Markdown image with optional title: `![alt](url "title")`. Captures the
 * pieces around the URL so a callback can swap the URL safely.
 */
const MD_IMG_RE =
  /(!\[[^\]]*\]\()(\s*)(\S+?)((?:\s+"[^"]*")?\s*\))/g

/** HTML `<img src="url" ...>` (single or double quoted). */
const HTML_IMG_RE =
  /(<img\b[^>]*?\bsrc\s*=\s*["'])([^"']+)(["'][^>]*?>)/gi

/** Fenced code blocks we never rewrite inside. */
const CODE_FENCE_RE = /```[\s\S]*?```|~~~[\s\S]*?~~~/g

/**
 * Per CommonMark, a backslash before any ASCII punctuation is an escape and
 * the backslash should be dropped — markdown editors often emit `\_` inside
 * URLs to keep underscores from triggering emphasis. Strip those before we
 * fetch / cache the URL so we don't 404 on a literal `\_` request.
 */
function unescapeMdUrl(s: string): string {
  return s.replace(/\\([!-/:-@[-`{-~])/g, "$1")
}

/** All body-image URLs that live outside fenced code blocks. */
function findBodyImageUrls(content: string): string[] {
  const urls: string[] = []
  const visit = (segment: string) => {
    for (const m of segment.matchAll(MD_IMG_RE)) urls.push(unescapeMdUrl(m[3]!))
    for (const m of segment.matchAll(HTML_IMG_RE)) urls.push(unescapeMdUrl(m[2]!))
  }
  let cursor = 0
  for (const fm of content.matchAll(CODE_FENCE_RE)) {
    visit(content.slice(cursor, fm.index))
    cursor = fm.index + fm[0].length
  }
  visit(content.slice(cursor))
  return urls
}

/** True when at least one body image is on a host other than icco.imgix.net. */
function bodyHasNonImgixImage(content: string): boolean {
  return findBodyImageUrls(content).some(isRewritableImageUrl)
}

function isRewritableImageUrl(raw: string): boolean {
  const u = raw.trim()
  if (!u || u.startsWith("data:") || u.startsWith("#")) return false
  if (!/^https?:\/\//i.test(u)) return false
  if (isIccoImgixUrl(u)) return false
  return isLikelyImageUrl(u)
}

/**
 * Upload every non-icco-imgix body image to photos.natwelch.com and replace
 * its URL in the markdown with the returned `https://icco.imgix.net/…` URL.
 * Identical source URLs are uploaded once and reused. URLs inside fenced
 * code blocks are left alone.
 */
async function rewriteBodyImagesToImgix(content: string): Promise<{
  content: string
  rewrote: number
  failed: number
}> {
  const candidates = Array.from(
    new Set(findBodyImageUrls(content).filter(isRewritableImageUrl))
  )
  if (!candidates.length) {
    return { content, rewrote: 0, failed: 0 }
  }

  const map = new Map<string, string>()
  let failed = 0
  for (const url of candidates) {
    try {
      console.log(
        `  → Body image → imgix: ${url.slice(0, 80)}${url.length > 80 ? "…" : ""}`
      )
      map.set(url, await uploadSourceImageToPhotos(url))
    } catch (err) {
      failed += 1
      console.error(`    Upload failed: ${(err as Error).message}`)
    }
  }
  if (!map.size) {
    return { content, rewrote: 0, failed }
  }

  let rewrote = 0
  const rewriteSegment = (segment: string): string => {
    let out = segment.replace(MD_IMG_RE, (full, pre, ws, url, tail) => {
      const next = map.get(unescapeMdUrl(url))
      if (!next) return full
      rewrote += 1
      return `${pre}${ws}${next}${tail}`
    })
    out = out.replace(HTML_IMG_RE, (full, pre, url, post) => {
      const next = map.get(unescapeMdUrl(url))
      if (!next) return full
      rewrote += 1
      return `${pre}${next}${post}`
    })
    return out
  }

  let cursor = 0
  let result = ""
  for (const fm of content.matchAll(CODE_FENCE_RE)) {
    result += rewriteSegment(content.slice(cursor, fm.index))
    result += fm[0]
    cursor = fm.index + fm[0].length
  }
  result += rewriteSegment(content.slice(cursor))

  return { content: result, rewrote, failed }
}

async function generateSummary(
  title: string,
  content: string
): Promise<string | null> {
  const plainText = (await stripMd(content)).substring(0, 3000)

  const prompt = `You are writing a short summary for a personal blog post titled "${title}".

Write one or two natural sentences that describe what the post is about. Refer to the author as "Nat" — never "the author", "he", or "they". Be plain and direct — no marketing language, no hashtags, no clickbait. Match the casual tone of the blog.

The summary should be under 160 characters and work well as a meta description.

Post content:
${plainText}

Reply with only the summary, nothing else.`

  try {
    const result = await callGemini(prompt)
    if (!result) return null
    if (result.length > 160) {
      console.warn(
        `  Warning: summary is ${result.length} chars (aim for ≤160)`
      )
    }
    return result
  } catch (err) {
    console.error(`  Error: ${(err as Error).message}`)
    return null
  }
}

/** Tidy whitespace, strip wrapping quotes, cap length, ensure terminal punctuation. */
function cleanAltText(raw: string, max = 200): string {
  let t = raw.replace(/\s+/g, " ").trim()
  t = t.replace(/^["'“”‘’]|["'“”‘’]$/g, "").trim()
  t = t.replace(/^(image|photo|photograph|picture|alt(\s*text)?)\s*:\s*/i, "")
  t = t.replace(/^(an? |the )?(image|photo|photograph|picture) (of|showing) /i, "")
  if (t.length > max) {
    const cut = t.slice(0, max + 1)
    const space = cut.lastIndexOf(" ")
    t = (space > 60 ? cut.slice(0, space) : t.slice(0, max - 1)).trim()
    t = t.replace(/[,;:\s\-–—]+$/g, "")
    if (!/[.!?…]$/.test(t)) {
      t += "…"
    }
  } else {
    t = t.replace(/[,;:\s\-–—]+$/g, "")
    if (t && !/[.!?]$/.test(t)) {
      t += "."
    }
  }
  return t
}

/**
 * Single, focused multimodal call: ask Gemini to describe the image in one
 * sentence, no escape hatches. We log the raw response so the failure mode
 * is never silent; let cleanAltText handle minor formatting issues.
 *
 * @see https://ai.google.dev/gemini-api/docs/vision
 */
async function buildHeaderImageAltText(
  finalImageUrl: string,
  postTitle: string,
  mdAltHint: string
): Promise<string | null> {
  const image = await fetchImageForVision(finalImageUrl)
  if (!image) {
    return null
  }
  const userPrompt = [
    "Write a single concise HTML alt-text sentence for the image above.",
    "",
    "Hard rules:",
    "- 6 to 14 words. One sentence. End with a period.",
    "- Lead with the subject; cut filler like \"this image shows\", \"a photo of\", \"there is\", \"we can see\".",
    "- Mention only the most important things: subject, action, setting. Skip lighting, mood, and minor background details.",
    "- Don't invent text on signs, screens, or clothing. If text is present but unreadable, just say so generically.",
    "- Don't name specific real people, brands, or places unless they're unmistakable (clear logo, famous landmark).",
    "- If the image is blank, broken, or unreadable, reply with the single word: NONE.",
    "",
    `Context (do not describe; describe the photo): blog post titled ${JSON.stringify(postTitle)}.`,
    mdAltHint
      ? `Author's original markdown alt was ${JSON.stringify(mdAltHint)}. Use only if consistent with what you see; otherwise ignore.`
      : "",
    "",
    "Output the sentence only (no quotes, no preface, no explanation).",
  ]
    .filter(Boolean)
    .join("\n")

  const { text, meta } = await describeImageWithGemini(image, userPrompt)
  if (!text) {
    console.error(`  Gemini returned no text. ${meta}`)
    return null
  }
  console.log(`  ↳ raw: ${text.replace(/\s+/g, " ").slice(0, 240)}`)
  if (/^NONE\.?$/i.test(text.trim())) {
    return null
  }
  const cleaned = cleanAltText(text, 200)
  if (cleaned.length < 5) {
    return null
  }
  return cleaned
}

function readMatter(filePath: string) {
  const fileRaw = fs.readFileSync(filePath, "utf8")
  return { parsed: matter(fileRaw) }
}

function writeMatterFile(
  filePath: string,
  data: Record<string, unknown>,
  content: string
) {
  const body = content.endsWith("\n") ? content : content + "\n"
  fs.writeFileSync(filePath, matter.stringify(body, data), "utf8")
}

function needWork(
  data: {
    summary?: string
    header_image?: string
    header_image_alt_text?: string
  },
  content: string
): {
  needSummary: boolean
  needHeader: boolean
  needHeaderAltOnly: boolean
  needBodyRewrite: boolean
} {
  const hasImage = String(data.header_image || "").trim()
  return {
    needSummary: !String(data.summary || "").trim(),
    needHeader: !hasImage,
    needHeaderAltOnly: Boolean(hasImage && !String(data.header_image_alt_text || "").trim()),
    needBodyRewrite: bodyHasNonImgixImage(content),
  }
}

function gitCommit(filePath: string, postId: string, msg: string) {
  try {
    execFileSync("git", ["add", filePath], { stdio: "pipe" })
    execFileSync("git", ["commit", "-m", msg], { stdio: "pipe" })
    console.log(`  Committed: ${msg}`)
  } catch (err) {
    console.error(`  Git commit failed: ${(err as Error).message}`)
  }
}

async function main() {
  const specificId = process.argv[2]

  let postFiles: string[]
  if (specificId) {
    const p = path.join(POSTS_DIR, `${specificId}.md`)
    if (!fs.existsSync(p)) {
      console.error(`Post ${specificId} not found.`)
      process.exit(1)
    }
    postFiles = [p]
  } else {
    postFiles = fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
      .map((f) => path.join(POSTS_DIR, f))
    shuffleInPlace(postFiles)
  }

  console.log(`Processing ${postFiles.length} post(s)...\n`)

  for (const postFile of postFiles) {
    const postId = path.basename(postFile, path.extname(postFile))
    const { parsed: initial } = readMatter(postFile)
    const initialContent = String(initial.content ?? "")
    const { needSummary, needHeader, needHeaderAltOnly, needBodyRewrite } =
      needWork(initial.data, initialContent)

    if (!needSummary && !needHeader && !needHeaderAltOnly && !needBodyRewrite) {
      continue
    }

    console.log(`Post ${postId}: ${(initial.data.title as string) || "(untitled)"}`)

    const data: Record<string, unknown> = { ...initial.data }
    let content = initialContent

    let didHeader = false
    let didHeaderAlt = false
    let didBodyRewrite = false
    if (needHeader) {
      const ex = tryExtractLeadingImage(content)
      if (ex) {
        let finalImageUrl = ""
        try {
          finalImageUrl = await ensureIccoHeaderImageUrl(ex.url)
        } catch (err) {
          console.error(`  ${(err as Error).message}`)
          console.log(
            `  (Header image not moved: fix upload or use an ${ICCO_IMGIX_HOST} URL.)`
          )
        }
        if (finalImageUrl) {
          console.log(
            `  → Moving to front matter: ${finalImageUrl.slice(0, 72)}${finalImageUrl.length > 72 ? "…" : ""}`
          )
          content = ex.stripped
          data.header_image = finalImageUrl
          const alt = await buildHeaderImageAltText(
            finalImageUrl,
            String(data.title || "Untitled"),
            ex.hintAlt
          )
          if (alt) {
            data.header_image_alt_text = alt
            console.log(`  → Alt: ${alt}`)
          } else {
            console.log(
              `  → (No alt: site will use title as fallback, or set alt in the markdown ![] or front matter.)`
            )
          }
          didHeader = true
        }
      }
    }

    if (!needHeader && needHeaderAltOnly) {
      const u = String(data.header_image || "").trim()
      if (u) {
        const alt = await buildHeaderImageAltText(
          u,
          String(data.title || "Untitled"),
          ""
        )
        if (alt) {
          data.header_image_alt_text = alt
          console.log(`  → Alt (for existing header image): ${alt}`)
          didHeaderAlt = true
        } else {
          console.log(
            `  → (No alt for existing image; set header_image_alt_text by hand, or re-add the image in markdown with a good ![]() caption to promote again.)`
          )
        }
      }
    }

    // Rewrite remaining non-icco-imgix body images. Run after the header
    // extraction so the leading image isn't uploaded twice.
    if (bodyHasNonImgixImage(content)) {
      const r = await rewriteBodyImagesToImgix(content)
      if (r.rewrote > 0) {
        content = r.content
        didBodyRewrite = true
        console.log(
          `  → Rewrote ${r.rewrote} body image(s) to icco.imgix.net${r.failed ? ` (${r.failed} failed)` : ""}`
        )
      } else if (r.failed > 0) {
        console.log(
          `  (Body image rewrite: ${r.failed} failed; nothing changed.)`
        )
      }
    }

    if (needSummary) {
      const newSummary = await generateSummary(
        String(data.title || "Untitled"),
        content
      )
      if (newSummary) {
        console.log(`  → ${newSummary}`)
        data.summary = newSummary
      } else {
        console.log(`  Failed to generate summary`)
      }
    } else {
      console.log(`  (Summary already present, skipped)`)
    }

    const summaryAdded =
      needSummary &&
      Boolean(String(data.summary || "").trim()) &&
      !String(initial.data.summary || "").trim()

    if (didHeader || didHeaderAlt || didBodyRewrite || summaryAdded) {
      writeMatterFile(postFile, data, content)
      const parts: string[] = []
      if (didHeader) {
        parts.push("header")
      }
      if (didHeaderAlt) {
        parts.push("header alt")
      }
      if (didBodyRewrite) {
        parts.push("body images")
      }
      if (summaryAdded) {
        parts.push("summary")
      }
      const label = parts.length ? parts.join(" + ") : "post"
      gitCommit(
        postFile,
        postId,
        `chore: ${label} for post ${postId}`
      )
    } else {
      if (needHeader && !didHeader) {
        console.log(`  (No leading image in body; no header change.)`)
      } else {
        console.log(`  (No file changes to save.)`)
      }
    }

    await new Promise((r) => setTimeout(r, 1000))
  }

  console.log("\nDone!")
}

main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
