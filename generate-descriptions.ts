#!/usr/bin/env tsx

/**
 * Script to generate descriptions for blog posts using Google Gemini API
 *
 * Usage:
 *   ts-node generate-descriptions.ts [post-id]
 *   tsx generate-descriptions.ts [post-id]
 *
 * If post-id is provided, generates description for that specific post.
 * If no post-id is provided, generates descriptions for all posts without summaries.
 *
 * Set GEMINI_API_KEY environment variable before running:
 *   export GEMINI_API_KEY="your-api-key"
 */

import * as fs from "fs"
import * as path from "path"
import * as https from "https"
import { remark } from "remark"
import stripMarkdown from "strip-markdown"
const matter = require("gray-matter")

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = "gemini-2.0-flash-exp" // Latest model as of 2026
const POSTS_DIR = path.join(__dirname, "posts")

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.")
  console.error("Please set it before running this script:")
  console.error('  export GEMINI_API_KEY="your-api-key"')
  process.exit(1)
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

interface PostFrontmatter {
  summary?: string
  title?: string
  id?: number
  datetime?: string
  draft?: boolean
  permalink?: string
  [key: string]: any
}

/**
 * Makes a request to the Gemini API
 */
function callGeminiAPI(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    })

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    }

    const req = https.request(options, (res) => {
      let body = ""
      res.on("data", (chunk) => (body += chunk))
      res.on("end", () => {
        if (res.statusCode !== 200) {
          reject(
            new Error(
              `API request failed with status ${res.statusCode}: ${body}`
            )
          )
          return
        }
        try {
          const response: GeminiResponse = JSON.parse(body)
          const text = response.candidates?.[0]?.content?.parts?.[0]?.text
          resolve(text || "")
        } catch (err) {
          reject(
            new Error(
              `Failed to parse API response: ${(err as Error).message}`
            )
          )
        }
      })
    })

    req.on("error", reject)
    req.write(data)
    req.end()
  })
}

/**
 * Generates a description for a post using Gemini
 */
async function generateDescription(postContent: string): Promise<string | null> {
  const parsed = matter(postContent)
  const frontmatter = parsed.data as PostFrontmatter
  const content = parsed.content

  // Strip markdown formatting using remark
  const file = await remark()
    .use(stripMarkdown)
    .process(content)
  
  const cleanContent = String(file)
    .trim()
    .substring(0, 3000) // Limit to first 3000 chars to keep prompt reasonable

  const prompt = `Write a concise, engaging meta description (max 160 characters) for a blog post titled "${frontmatter.title || "Untitled"}". 

The post content is:
${cleanContent}

Generate only the meta description text, nothing else. Make it compelling and accurately summarize the main point.`

  try {
    const description = await callGeminiAPI(prompt)
    const trimmed = description.trim()
    
    // Return null if empty
    if (!trimmed) {
      return null
    }
    
    // Warn if description exceeds recommended length
    if (trimmed.length > 160) {
      console.warn(`  Warning: Generated description is ${trimmed.length} characters (recommended max: 160)`)
    }
    
    return trimmed
  } catch (error) {
    console.error(`Error generating description: ${(error as Error).message}`)
    return null
  }
}

/**
 * Updates a markdown file with a new summary
 */
function updatePostWithSummary(filePath: string, summary: string): boolean {
  const content = fs.readFileSync(filePath, "utf8")
  const parsed = matter(content)
  const frontmatter = parsed.data as PostFrontmatter

  // Check if summary already exists
  if (frontmatter.summary && frontmatter.summary.trim().length > 0) {
    console.log(`  Skipping: post already has a summary`)
    return false
  }

  // Add summary to frontmatter
  frontmatter.summary = summary
  
  // Stringify with gray-matter, preserving formatting
  const updatedContent = matter.stringify(parsed.content, frontmatter)
  fs.writeFileSync(filePath, updatedContent, "utf8")
  return true
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const specificPostId = args[0]

  let postFiles: string[]
  if (specificPostId) {
    const postFile = path.join(POSTS_DIR, `${specificPostId}.md`)
    if (!fs.existsSync(postFile)) {
      console.error(`Error: Post ${specificPostId} not found.`)
      process.exit(1)
    }
    postFiles = [postFile]
  } else {
    // Get all markdown files
    postFiles = fs
      .readdirSync(POSTS_DIR)
      .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
      .map((file) => path.join(POSTS_DIR, file))
  }

  console.log(`Processing ${postFiles.length} post(s)...\n`)

  for (const postFile of postFiles) {
    const postId = path.basename(postFile, path.extname(postFile))
    console.log(`Processing post ${postId}...`)

    const content = fs.readFileSync(postFile, "utf8")
    const parsed = matter(content)
    const frontmatter = parsed.data as PostFrontmatter

    // Skip if already has summary
    if (frontmatter.summary && frontmatter.summary.toString().trim()) {
      console.log(`  Skipping: already has summary\n`)
      continue
    }

    console.log(`  Generating description...`)
    const description = await generateDescription(content)

    if (description) {
      console.log(`  Generated: ${description}`)
      const updated = updatePostWithSummary(postFile, description)
      if (updated) {
        console.log(`  ✓ Updated post with summary\n`)
      }
    } else {
      console.log(`  ✗ Failed to generate description\n`)
    }

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log("Done!")
}

main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
