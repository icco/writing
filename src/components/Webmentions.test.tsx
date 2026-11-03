import { renderToStaticMarkup } from "react-dom/server"
import { mf2 } from "microformats-parser"
import { expect, test } from "vitest"
import { emptyReactions, type Reaction } from "@/lib/webmentions"
import { Webmentions } from "./Webmentions"
const target = "https://writing.natwelch.com/post/1"

test("empty reactions add no section", () => {
  expect(renderToStaticMarkup(<Webmentions reactions={emptyReactions()} target={target} />)).toBe("")
})

test("all reaction kinds render safe text and isolated citations", () => {
  const groups = emptyReactions()
  for (const [id, kind] of Object.keys(groups).entries()) {
    const reaction: Reaction = { id, kind: kind as Reaction["kind"], url: `https://example.com/${id}`, author: { name: "Reader", photo: id === 0 ? "https://avatars.webmention.io/a.png" : undefined }, text: "<script>evil</script>", name: "A mention" }
    groups[reaction.kind].push(reaction)
  }
  const html = renderToStaticMarkup(<article className="h-entry"><h1 className="p-name">Original</h1><div className="e-content">Body</div><Webmentions reactions={groups} target={target} /></article>)
  expect(html).toContain("1 likes")
  expect(html).toContain("1 reposts")
  expect(html).toContain("1 bookmarks")
  expect(html).toContain("&lt;script&gt;evil&lt;/script&gt;")
  expect(html).not.toContain("<script>")
  expect(html).toContain('width="32"')
  expect(html).toContain('referrerPolicy="no-referrer"')
  const entry = mf2(html, { baseUrl: target }).items[0]
  expect(entry.properties.name).toEqual(["Original"])
  expect(entry.properties.content).toMatchObject([{ value: "Body" }])
  expect(entry.properties.comment).toMatchObject([{ type: ["h-cite"], properties: { url: ["https://example.com/3"], author: [{ properties: { name: ["Reader"] } }] } }])
})
