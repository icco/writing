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

function normalizeImageUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname.includes("imgix.net")) {
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

function isLikelyImageUrl(u: string): boolean {
  const p = u.split("?")[0]!.toLowerCase()
  if (/\.(jpe?g|png|gif|webp|svg|avif|bmp|heic)$/.test(p)) return true
  if (u.includes("imgix.net/")) return true
  if (p.includes("staticflickr.com") || p.includes("static.flickr.com")) {
    return true
  }
  if (u.includes("flickr.com/") && p.includes("photos/")) return true
  if (p.includes("storage.googleapis.com") && /\.(jpe?g|png|gif|webp)($|\?)/.test(p)) return true
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

async function generateImageAlt(
  imageUrl: string,
  postTitle: string,
  mdAltHint: string,
  firstWordsOfPost: string
): Promise<string | null> {
  const prompt = `You are writing a concise alt (alternative text) string for a blog post header image.

Image URL: ${imageUrl}
Post title: ${postTitle}
${mdAltHint ? `Existing markdown / link text: "${mdAltHint}"\n` : ""}
First part of the post (after the image, plain text, may be short):
${firstWordsOfPost.slice(0, 500)}

Write one short, specific line (ideally 80–120 characters, max 200) for the HTML/OG image "alt" attribute. Describe what is in the image for people who use screen readers. Be concrete, not generic ("photo of equipment" is too vague). No quotes around the line. No "image of" prefix.

Reply with only the alt text, nothing else.`

  try {
    const result = await callGemini(prompt, 300)
    if (!result) return null
    const t = result.replace(/\s+/g, " ").replace(/^['"]|['"]$/g, "").trim()
    if (t.length > 200) {
      return t.slice(0, 197) + "…"
    }
    return t || null
  } catch (err) {
    console.error(`  Error (alt text): ${(err as Error).message}`)
    return null
  }
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
        console.log(
          `  → Moving leading image to front matter: ${ex.url.slice(0, 64)}${ex.url.length > 64 ? "…" : ""}`
        )
        content = ex.stripped
        data.header_image = ex.url
        const firstForAlt = (await stripMd(
          (content && content.trim() ? content : " ").slice(0, 1500)
        )).slice(0, 800)
        const alt = await generateImageAlt(
          ex.url,
          String(data.title || "Untitled"),
          ex.hintAlt,
          firstForAlt
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
