import { describe, expect, test, vi } from "vitest"

import { makePost } from "@/test/contentlayerFixture"

import generateFeed from "./feed"

describe("generateFeed", () => {
  test("renders posts, MDX components, and header images", async () => {
    const posts = [
      makePost({
        id: 10,
        summary: "sum",
        tags: ["a"],
        header_image: "https://icco.imgix.net/h.jpg",
        social_image: "https://images.natwelch.com/h.jpg",
        body: {
          code: "",
          raw: [
            "See [anchor](#x) and [rel](/post/1) and ![i](https://icco.imgix.net/p.png).",
            "",
            '<MusicEmbed src="/audio/a.ogg" title="T & <x>" caption="C" />',
            "",
            '<MusicEmbed src="https://e.com/b" />',
            "",
            '<PhotoGrid urls={["https://e.com/1.jpg", "https://e.com/\\"2.jpg"]} alts={["one"]} />',
            "",
            "<PhotoGrid />",
          ].join("\n"),
        },
      }),
      makePost({
        id: 11,
        social_image: "/api/og?title=x&date=y",
      }),
      makePost({ id: 12, social_image: "not a url at all" }),
      makePost({ id: 13, social_image: "https://e.com/noext" }),
    ]
    const feed = await generateFeed(posts as never)
    const rss = feed.rss2()
    expect(rss).toContain("https://writing.natwelch.com/post/10#x")
    expect(rss).toContain("https://writing.natwelch.com/post/1")
    expect(rss).toContain("images.natwelch.com/p.png")
    expect(rss).toContain("audio/ogg")
    expect(rss).toContain("T &amp; &lt;x&gt;")
    expect(rss).toContain("audio/mpeg")
    expect(rss).toContain('alt="one"')
    expect(rss).toContain("Photo 2")
    expect(rss).toContain('<enclosure url="https://images.natwelch.com/h.jpg"')
    expect(rss).not.toContain("/api/og?")
    expect(feed.atom1()).toContain("<title")
  })

  test("falls back when markdown rendering fails", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const bad = makePost({ id: 20 })
    // A body whose `raw` getter throws forces the error path.
    Object.defineProperty(bad, "body", {
      get() {
        return {
          get raw(): string {
            throw new Error("boom")
          },
        }
      },
    })
    const feed = await generateFeed([bad] as never)
    expect(feed.rss2()).toContain("Error rendering post content")
    expect(err).toHaveBeenCalled()
    err.mockRestore()
  })
})
