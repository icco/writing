/**
 * Generate summaries for blog posts using Google Gemini.
 *
 * Usage:
 *   tsx generate-descriptions.ts [post-id]
 *
 * Set GEMINI_API_KEY environment variable before running.
 */

import * as fs from "fs"
import * as path from "path"
import { execFileSync } from "child_process"
import { remark } from "remark"
import stripMarkdown from "strip-markdown"
const matter = require("gray-matter")

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = "gemini-2.5-flash"
const POSTS_DIR = path.join(__dirname, "posts")
const MAX_RETRIES = 3

if (!GEMINI_API_KEY) {
  console.error(
    "GEMINI_API_KEY is not set. Export it before running this script."
  )
  process.exit(1)
}

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    })

    if (res.status >= 500 && attempt < MAX_RETRIES - 1) {
      const delay = (attempt + 1) * 2000
      console.log(`  Retrying in ${delay}ms...`)
      await new Promise((r) => setTimeout(r, delay))
      continue
    }

    if (!res.ok) {
      throw new Error(`Gemini API error ${res.status}: ${await res.text()}`)
    }

    const json = await res.json()
    const candidate = json.candidates?.[0]
    if (candidate?.finishReason === "MAX_TOKENS") {
      throw new Error("Response truncated — increase maxOutputTokens")
    }
    return candidate?.content?.parts?.[0]?.text?.trim() ?? ""
  }

  throw new Error("Gemini API failed after retries")
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

Write one or two natural sentences that describe what the post is about. Write in third person. Be plain and direct — no marketing language, no hashtags, no clickbait. Match the casual tone of the blog.

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

function updatePost(filePath: string, summary: string): boolean {
  const raw = fs.readFileSync(filePath, "utf8")
  const parsed = matter(raw)

  if (parsed.data.summary?.toString().trim()) {
    console.log(`  Skipping: already has summary`)
    return false
  }

  parsed.data.summary = summary
  fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data))
  return true
}

function gitCommit(filePath: string, postId: string): void {
  try {
    execFileSync("git", ["add", filePath], { stdio: "pipe" })
    execFileSync("git", ["commit", "-m", `Add summary for post ${postId}`], {
      stdio: "pipe",
    })
    console.log(`  Committed`)
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
    const raw = fs.readFileSync(postFile, "utf8")
    const parsed = matter(raw)
    const { title, summary } = parsed.data

    if (summary?.toString().trim()) {
      continue // silently skip posts that already have summaries
    }

    console.log(`Post ${postId}: ${title || "(untitled)"}`)
    const newSummary = await generateSummary(
      title || "Untitled",
      parsed.content
    )

    if (newSummary) {
      console.log(`  → ${newSummary}`)
      if (updatePost(postFile, newSummary)) {
        gitCommit(postFile, postId)
      }
    } else {
      console.log(`  Failed to generate summary`)
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1000))
  }

  console.log("\nDone!")
}

main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
