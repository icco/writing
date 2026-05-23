import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, test } from "vitest"

import {
  characterCount,
  countBodyImages,
  countMarkdownHeadings,
  countMarkdownLinks,
  stripCodeFromRaw,
} from "./postBodyMetrics"

const here = path.dirname(fileURLToPath(import.meta.url))
const POSTS_DIR = path.resolve(here, "../../posts")

function readPostBody(id: number): string {
  const raw = readFileSync(path.join(POSTS_DIR, `${id}.md`), "utf8")
  // Strip the leading YAML front-matter block; metrics are computed against
  // the MDX body in `contentlayer.config.ts`, not the front-matter.
  if (!raw.startsWith("---")) return raw
  const end = raw.indexOf("\n---", 3)
  if (end === -1) return raw
  return raw.slice(end + 4).replace(/^\n/, "")
}

describe("stripCodeFromRaw", () => {
  test("removes triple-backtick fenced blocks", () => {
    const raw = "before\n```js\nconst x = ![not](img)\n```\nafter"
    const stripped = stripCodeFromRaw(raw)
    expect(stripped).not.toContain("![not](img)")
    expect(stripped).toContain("before")
    expect(stripped).toContain("after")
  })

  test("removes inline backticks", () => {
    const raw = "Use `![alt](img)` to embed."
    expect(stripCodeFromRaw(raw)).not.toContain("![alt](img)")
  })

  test("does not cross newlines for inline backticks", () => {
    // The single-line inline regex must not greedily consume across lines.
    const raw = "`open\nclose` keeps lines intact"
    const stripped = stripCodeFromRaw(raw)
    expect(stripped).toContain("open")
    expect(stripped).toContain("close")
  })
})

describe("characterCount", () => {
  test("returns raw .length", () => {
    expect(characterCount("")).toBe(0)
    expect(characterCount("hello")).toBe(5)
    expect(characterCount("héllo")).toBe(5)
  })
})

describe("countMarkdownHeadings", () => {
  test("counts ATX headings of all levels", () => {
    const raw = "# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6"
    expect(countMarkdownHeadings(raw)).toBe(6)
  })

  test("ignores `#hashtag` with no space", () => {
    const raw = "Some text #art and #music here.\n\n# Real heading"
    expect(countMarkdownHeadings(raw)).toBe(1)
  })

  test("ignores headings inside fenced code", () => {
    const raw = "```md\n# Not a heading\n```\n\n# Real heading"
    expect(countMarkdownHeadings(raw)).toBe(1)
  })

  test("returns 0 when there are no headings", () => {
    expect(countMarkdownHeadings("just a paragraph")).toBe(0)
  })
})

describe("countMarkdownLinks", () => {
  test("counts inline `[text](url)` links", () => {
    const raw = "See [one](https://a.example) and [two](https://b.example)."
    expect(countMarkdownLinks(raw)).toBe(2)
  })

  test("does not count image syntax `![alt](url)`", () => {
    const raw = "![pic](https://img.example) and [link](https://l.example)"
    expect(countMarkdownLinks(raw)).toBe(1)
  })

  test("counts angle-bracket autolinks", () => {
    const raw = "Visit <https://a.example> and <https://b.example>."
    expect(countMarkdownLinks(raw)).toBe(2)
  })

  test("ignores links inside fenced code", () => {
    const raw =
      "```\n[code](https://x.example)\n```\n\n[real](https://r.example)"
    expect(countMarkdownLinks(raw)).toBe(1)
  })

  test("counts GFM bare-URL autolink-literals", () => {
    const raw = "See https://a.example and http://b.example for details."
    expect(countMarkdownLinks(raw)).toBe(2)
  })

  test("counts bare www. autolinks", () => {
    const raw = "Visit www.example.com today."
    expect(countMarkdownLinks(raw)).toBe(1)
  })

  test("does not double-count URLs that appear inside [text](url)", () => {
    const raw = "Read [the post](https://example.com/post) please."
    expect(countMarkdownLinks(raw)).toBe(1)
  })

  test("does not count URLs inside fenced code blocks as bare links", () => {
    const raw = "```\nfetch('https://api.example.com')\n```\nplain prose"
    expect(countMarkdownLinks(raw)).toBe(0)
  })

  test("regression: post 777 has 3 links (2 bare URLs + 1 markdown)", () => {
    // /post/777 reported 0 links before this fix; the body has two bare
    // https:// URLs (outside fenced code) and one [reddit](…) markdown link.
    expect(countMarkdownLinks(readPostBody(777))).toBe(3)
  })
})

describe("countBodyImages", () => {
  test("counts markdown `![alt](url)` images", () => {
    const raw = "![a](x.png) and ![b](y.png)"
    expect(countBodyImages(raw)).toBe(2)
  })

  test("counts raw `<img>` HTML tags", () => {
    const raw = `<img src="a.png" alt="a" />\n<img src="b.png">`
    expect(countBodyImages(raw)).toBe(2)
  })

  test("ignores images inside fenced code", () => {
    const raw = "```\n![code](x.png)\n```\n\n![real](r.png)"
    expect(countBodyImages(raw)).toBe(1)
  })

  test("counts entries in <PhotoGrid urls={[…]} />", () => {
    const raw = `
<PhotoGrid
  urls={[
    "https://example.com/1.jpg",
    "https://example.com/2.jpg",
    "https://example.com/3.jpg",
  ]}
/>
`
    expect(countBodyImages(raw)).toBe(3)
  })

  test("counts entries across multiple <PhotoGrid /> tags", () => {
    const raw = `
<PhotoGrid urls={["a.jpg", "b.jpg"]} />

Some prose between.

<PhotoGrid
  urls={["c.jpg", "d.jpg", "e.jpg"]}
  alts={["c", "d", "e"]}
/>
`
    expect(countBodyImages(raw)).toBe(5)
  })

  test("PhotoGrid contribution adds to markdown / <img> totals", () => {
    const raw = `
![hero](hero.jpg)

<img src="inline.jpg" alt="" />

<PhotoGrid urls={["a.jpg", "b.jpg"]} />
`
    expect(countBodyImages(raw)).toBe(4)
  })

  test("ignores PhotoGrid examples that appear inside fenced code", () => {
    const raw = `
\`\`\`mdx
<PhotoGrid urls={["fake.jpg", "also-fake.jpg"]} />
\`\`\`

<PhotoGrid urls={["real.jpg"]} />
`
    expect(countBodyImages(raw)).toBe(1)
  })

  test("returns 0 for prose with no images", () => {
    expect(countBodyImages("just words, no pictures.")).toBe(0)
  })

  test("regression: post 773 body has 10 PhotoGrid images", () => {
    // /post/773 reported 0 images before this fix; the body contains a single
    // <PhotoGrid /> with ten urls. The header_image (+1) is added by the
    // contentlayer resolver, not by countBodyImages.
    expect(countBodyImages(readPostBody(773))).toBe(10)
  })

  test("regression: post 774 body has 0 images", () => {
    // /post/774's only image is the front-matter header_image, which is added
    // by the contentlayer resolver. The body itself has no images.
    expect(countBodyImages(readPostBody(774))).toBe(0)
  })
})
