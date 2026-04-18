/**
 * Generate summaries for blog posts using Google Gemini.
 *
 * Usage:
 *   tsx generate-descriptions.ts [post-id]
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
const matter = require("gray-matter")

const GEMINI_MODEL = "gemini-2.5-flash"
const POSTS_DIR = path.join(__dirname, "posts")

function makeClient(): { ai: GoogleGenAI; useVertexAI: boolean } {
  if (process.env.GEMINI_API_KEY) {
    return {
      ai: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }),
      useVertexAI: false,
    }
  }

  let project: string | null = null
  try {
    project = execFileSync("gcloud", ["config", "get-value", "project"], {
      stdio: ["pipe", "pipe", "pipe"],
    })
      .toString()
      .trim() || null
  } catch {
    // ignore
  }

  if (!project) {
    console.error(
      "No auth available: set GEMINI_API_KEY or configure gcloud (`gcloud auth login && gcloud config set project <project>`)"
    )
    process.exit(1)
  }

  return {
    ai: new GoogleGenAI({ vertexai: true, project, location: "us-central1" }),
    useVertexAI: true,
  }
}

const { ai, useVertexAI } = makeClient()

async function callGemini(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: useVertexAI ? `publishers/google/models/${GEMINI_MODEL}` : GEMINI_MODEL,
    contents: prompt,
    config: { temperature: 0.7, maxOutputTokens: 1024 },
  })
  return response.text?.trim() ?? ""
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
