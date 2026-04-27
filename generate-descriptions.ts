/**
 * Generate summaries for blog posts and optionally move a leading in-body
 * image to front matter (header_image / header_image_alt_text) when missing.
 *
 * Usage:
 *   yarn generate-descriptions
 *   yarn generate-descriptions 772
 *
 * Auth (in priority order):
 *   1. GEMINI_API_KEY environment variable
 *   2. gcloud ADC via Vertex AI (uses active gcloud project)
 *
 * Non-`icco.imgix.net` images found for `header_image` are downloaded and
 * uploaded through photos.natwelch.com (POST multipart `photo` to
 * `PHOTOS_UPLOAD_URL`, default `https://photos.natwelch.com/api/upload`), which
 * must return JSON `{ success, files: [{ url: "https://icco.imgix.net/…" }] }`
 * (supported by the photos app upload route).
 */

import * as fs from "fs"
import * as path from "path"
import { execFileSync } from "child_process"
import { GoogleGenAI } from "@google/genai"
import { remark } from "remark"
import stripMarkdown from "strip-markdown"
import matter from "gray-matter"

const GEMINI_MODEL = "gemini-2.5-flash"
const POSTS_DIR = path.join(__dirname, "posts")

const ICCO_IMGIX_HOST = "icco.imgix.net"
const DEFAULT_PHOTOS_UPLOAD = "https://photos.natwelch.com/api/upload"
const MAX_IMPORT_IMAGE_BYTES = 25 * 1024 * 1024
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

async function callGemini(prompt: string, maxOutputTokens = 1024): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: `publishers/google/models/${GEMINI_MODEL}`,
      contents: prompt,
      config: { temperature: 0.5, maxOutputTokens },
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

/** Build a suitable fetch URL: prefer a bounded size for imgix. */
function urlForVisionFetch(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname === ICCO_IMGIX_HOST) {
      u.searchParams.set("w", "1280")
      u.searchParams.set("auto", "format,compress")
    }
    return u.toString()
  } catch {
    return url
  }
}

async function fetchImageForVision(
  publicUrl: string
): Promise<{ data: string; mime: string } | null> {
  const tryUrl = (href: string) => fetch(href, { headers: { Accept: "image/*" } })
  const url = urlForVisionFetch(publicUrl)
  let r = await tryUrl(url)
  if (!r.ok) {
    r = await tryUrl(publicUrl)
  }
  if (!r.ok) {
    console.error(`  Could not download image for vision alt: ${r.status}`)
    return null
  }
  const ct = (r.headers.get("content-type") || "").split(";")[0]!.trim()
  let ab = await r.arrayBuffer()
  if (ab.byteLength > MAX_VISION_INLINE_BYTES) {
    if (isIccoImgixUrl(publicUrl)) {
      const u = new URL(publicUrl)
      u.searchParams.set("w", "768")
      u.searchParams.set("auto", "format,compress")
      r = await tryUrl(u.toString())
      if (r.ok) {
        ab = await r.arrayBuffer()
      }
    }
  }
  if (ab.byteLength > MAX_VISION_INLINE_BYTES) {
    console.error(
      `  Image still too large for inline vision (~${(ab.byteLength / 1e6).toFixed(1)}MB); skip alt.`
    )
    return null
  }
  const mime =
    ct && ct.startsWith("image/")
      ? ct
      : (() => {
          const p = new URL(publicUrl).pathname
          const ext = path.extname(p).toLowerCase()
          if (ext === ".png") return "image/png"
          if (ext === ".gif") return "image/gif"
          if (ext === ".webp") return "image/webp"
          if (ext === ".svg" || ext === ".svgz") return "image/svg+xml"
          return "image/jpeg"
        })()
  return {
    data: Buffer.from(ab).toString("base64"),
    mime,
  }
}

/**
 * Image + text so the model sees pixels (text-only promps were hallucinating).
 * @see https://ai.google.dev/gemini-api/docs/vision
 */
async function callGeminiVision(
  userText: string,
  image: { data: string; mime: string }
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: `publishers/google/models/${GEMINI_MODEL}`,
      contents: {
        role: "user",
        parts: [
          { text: userText },
          { inlineData: { mimeType: image.mime, data: image.data } },
        ],
      },
      config: { temperature: 0.1, maxOutputTokens: 220 },
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
    console.error(`  Error (vision alt): ${msg}`)
    return ""
  }
}

function isIccoImgixUrl(url: string): boolean {
  try {
    return new URL(url).hostname === ICCO_IMGIX_HOST
  } catch {
    return false
  }
}

function extFromContentType(ct: string | null): string {
  if (!ct) {
    return ".jpg"
  }
  const m = ct.match(
    /image\/(jpeg|jpg|pjpeg|png|gif|webp|svg\+xml|heic|heif|bmp)/i
  )
  if (!m) {
    return ".jpg"
  }
  const t = m[1]!.toLowerCase()
  if (t === "jpeg" || t === "pjpeg" || t === "jpg") {
    return ".jpg"
  }
  if (t === "png") {
    return ".png"
  }
  if (t === "gif") {
    return ".gif"
  }
  if (t === "webp") {
    return ".webp"
  }
  if (t === "svg+xml") {
    return ".svg"
  }
  if (t === "heic" || t === "heif") {
    return ".heic"
  }
  if (t === "bmp") {
    return ".bmp"
  }
  return ".jpg"
}

function extFromPathname(url: string): string | null {
  try {
    const p = new URL(url).pathname
    const e = path.extname(p).toLowerCase()
    if (
      e &&
      [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".heic", ".heif", ".bmp"].includes(
        e
      )
    ) {
      return e === ".jpeg" ? ".jpg" : e
    }
  } catch {
    // ignore
  }
  return null
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
  const ext = extFromPathname(sourceUrl) || extFromContentType(ct)
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
  return (
    hostname === ICCO_IMGIX_HOST ||
    hostname === "natnatnat.imgix.net" ||
    hostname.endsWith(".imgix.net")
  )
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

/** Model often stops mid-phrase; strip a trailing "looking at" with no object, etc. */
function trimDanglingImageAlt(alt: string): string {
  return alt
    .replace(/\s+/g, " ")
    .replace(/^['"]|['"]$/g, "")
    .trim()
    .replace(
      /[\s,;]+(looking|staring|peering|glancing|pointing) at$/i,
      ""
    )
    .replace(
      /[\s,;]+(sitting|standing|wearing) (in|on|at)\s*$/i,
      ""
    )
    .replace(
      /[\s,;]+(including|such as|with) one that reads$/i,
      ""
    )
    .replace(
      /[\s,;]+,?\s*including (one )?that reads?$/i,
      ""
    )
    .replace(/\s+$/g, "")
    .trim()
}

function capAltLength(alt: string, max = 200): string {
  if (alt.length <= max) {
    return alt
  }
  const snip = alt.slice(0, max + 1)
  const lastSpace = snip.lastIndexOf(" ")
  if (lastSpace > 60) {
    return snip.slice(0, lastSpace).replace(/[,.:;\s-]+$/g, "").trim()
  }
  return alt.slice(0, max - 1).trim() + "…"
}

function isBadOrInventedAlt(alt: string): boolean {
  const t = alt.replace(/\s+/g, " ").trim()
  if (t.length < 6 || t.length > 220) {
    return true
  }
  if (/^UNSURE(\.|!)?$|^I cannot (see|describe)\b/i.test(t)) {
    return true
  }
  if (/\bthat reads\s*\.?\s*$/i.test(t)) {
    return true
  }
  if (/(,\s*|\s)(including|such as)\s*\.?\s*$/i.test(t)) {
    return true
  }
  if (/\b(one|that) that\s*\.?\s*$/i.test(t) || /including one that\s*\.?\s*$/i.test(t)) {
    return true
  }
  if (/(^|\s)(at|in|on|of|to|for|with|as|from)\s*\.?\s*$/i.test(t)) {
    return true
  }
  if (t.split(/\s+/).length > 22) {
    return true
  }
  return false
}

/**
 * Use multimodal (image + text) so the model sees the photo. We no longer
 * send post body, which was biasing the model to invent “newsy” stories.
 */
async function generateImageAlt(
  finalImageUrl: string,
  postTitle: string,
  mdAltHint: string
): Promise<string | null> {
  const image = await fetchImageForVision(finalImageUrl)
  if (!image) {
    return null
  }
  const prompt = `The image to describe is below this text.

You are writing HTML \`alt\` text: one short, factual sentence (max ~25 words) describing ONLY what a sighted person would see in the image. End with a period.

Strict rules:
- Do NOT guess events, causes, or stories (e.g. protests, elections) unless the image clearly shows that.
- Do NOT invent or paraphrase text on signs unless you can read the exact words. If there is text but it is not legible, say "signs with text" or similar, not made-up quotes.
- Do not start with "Image of" or "Photo of."
- The blog post title (for your context only) is "${postTitle.replace(/"/g, '\\"')}" — the photo is not required to match this title; do not use the title to invent a scene.
${mdAltHint ? `Optional: old link text in markdown was: "${mdAltHint.replace(/"/g, '\\"')}" — use only if it matches the image; otherwise ignore.` : ""}
- If you really cannot see enough to describe, reply with exactly: UNSURE

Output only the alt line or the word UNSURE, nothing else.`

  const result = await callGeminiVision(prompt, image)
  if (!result || /^UNSURE(\.|!)?\s*$/i.test(result.trim())) {
    return null
  }
  let t = trimDanglingImageAlt(result)
  t = t.replace(/^[""']|[""']$/g, "").replace(/\s+/g, " ").trim()
  t = capAltLength(t, 200)
  t = t.replace(/[,;:,\s-]+$/g, "").trim()
  if (t && !/[.!?]$/.test(t)) {
    t += "."
  }
  if (isBadOrInventedAlt(t)) {
    return null
  }
  return t
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

function needWork(data: { summary?: string; header_image?: string }): {
  needSummary: boolean
  needHeader: boolean
} {
  return {
    needSummary: !String(data.summary || "").trim(),
    needHeader: !String(data.header_image || "").trim(),
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
  }

  console.log(`Processing ${postFiles.length} post(s)...\n`)

  for (const postFile of postFiles) {
    const postId = path.basename(postFile, path.extname(postFile))
    const { parsed: initial } = readMatter(postFile)
    const { needSummary, needHeader } = needWork(initial.data)

    if (!needSummary && !needHeader) {
      continue
    }

    console.log(`Post ${postId}: ${(initial.data.title as string) || "(untitled)"}`)

    const data: Record<string, unknown> = { ...initial.data }
    let content = String(initial.content ?? "")

    let didHeader = false
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
          const alt = await generateImageAlt(
            finalImageUrl,
            String(data.title || "Untitled"),
            ex.hintAlt
          )
          if (alt) {
            data.header_image_alt_text = alt
            console.log(`  → Alt: ${alt}`)
          } else {
            console.log(
              `  → (No alt from model; site will use title as fallback.)`
            )
          }
          didHeader = true
        }
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

    if (didHeader || summaryAdded) {
      writeMatterFile(postFile, data, content)
      const parts: string[] = []
      if (didHeader) {
        parts.push("header")
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
