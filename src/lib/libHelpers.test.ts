import { afterEach, describe, expect, test, vi } from "vitest"

import { allPosts, makePost } from "@/test/contentlayerFixture"

import {
  getHeaderImageAlt,
  toAbsoluteImageUrl,
  withHeaderCropDefaults,
} from "./absoluteImageUrl"
import { hashtagRegex, remarkHashtags } from "./hashtags"
import { remarkImageUrls } from "./imageUrls"
import imgixLoader from "./imgixLoader"
import publishedPosts, { getPostBySlug, nextPost, previousPost } from "./posts"
import { siteUrl } from "./siteUrl"
import { getCanonicalTag, normalizeTag } from "./tagAliases"

describe("absoluteImageUrl", () => {
  test("toAbsoluteImageUrl handles absolute and relative inputs", () => {
    expect(toAbsoluteImageUrl("https://icco.imgix.net/a.jpg", "x")).toBe(
      "https://images.natwelch.com/a.jpg"
    )
    expect(toAbsoluteImageUrl("http://e.com/a.jpg", "x")).toBe(
      "http://e.com/a.jpg"
    )
    expect(toAbsoluteImageUrl("/a.png", "https://s.com/")).toBe(
      "https://s.com/a.png"
    )
    expect(toAbsoluteImageUrl("a.png", "https://s.com")).toBe(
      "https://s.com/a.png"
    )
  })

  test("getHeaderImageAlt prefers alt text only with a header image", () => {
    const p = makePost({ id: 9, title: "T" })
    expect(getHeaderImageAlt(p)).toBe("T")
    expect(getHeaderImageAlt({ ...p, header_image: "h.jpg" })).toBe("T")
    expect(
      getHeaderImageAlt({
        ...p,
        header_image: "h.jpg",
        header_image_alt_text: "  ",
      })
    ).toBe("T")
    expect(
      getHeaderImageAlt({
        ...p,
        header_image: "h.jpg",
        header_image_alt_text: " alt ",
      })
    ).toBe("alt")
  })

  test("withHeaderCropDefaults", () => {
    expect(withHeaderCropDefaults("not a url")).toBe("not a url")
    expect(withHeaderCropDefaults("https://e.com/a.jpg")).toBe(
      "https://e.com/a.jpg"
    )
    const u = new URL(
      withHeaderCropDefaults("https://icco.imgix.net/a.jpg?fp-x=0.2")
    )
    expect(u.hostname).toBe("images.natwelch.com")
    expect(u.searchParams.get("fp-x")).toBe("0.2")
    expect(u.searchParams.get("ar")).toBe("2:1")
  })
})

describe("imgixLoader", () => {
  test("passes through foreign hosts and invalid urls", () => {
    expect(imgixLoader({ src: "https://e.com/a.jpg", width: 10 })).toBe(
      "https://e.com/a.jpg"
    )
    expect(imgixLoader({ src: "http://[bad", width: 10 })).toBe("http://[bad")
  })

  test("keeps explicit auto and omits quality when absent", () => {
    const u = new URL(
      imgixLoader({ src: "/a.jpg?auto=format", width: 100 })
    )
    expect(u.searchParams.get("auto")).toBe("format")
    expect(u.searchParams.has("q")).toBe(false)
  })
})

test("remarkImageUrls ignores non-objects", () => {
  expect(() => remarkImageUrls()(null)).not.toThrow()
  const tree = { children: [1, null, "https://icco.imgix.net/x"] }
  remarkImageUrls()(tree)
  expect(tree.children[2]).toBe("https://icco.imgix.net/x")
})

describe("hashtags", () => {
  test("links hashtags outside links", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "hi #Programming and \\#Cats" }],
        },
      ],
    }
    ;(remarkHashtags as () => (t: unknown) => void)()(tree)
    const kids = tree.children[0].children as Array<Record<string, unknown>>
    const links = kids.filter((k) => k.type === "link")
    expect(links.map((l) => l.url)).toEqual(["/tag/coding", "/tag/cat"])
    expect(hashtagRegex.source).toContain("tag")
  })
})

describe("tagAliases", () => {
  test("normalizes aliases, plurals, and approved plurals", () => {
    expect(normalizeTag("DevOps")).toBe("sre")
    expect(normalizeTag("Politics")).toBe("politics")
    expect(normalizeTag("cats")).toBe("cat")
    expect(getCanonicalTag("k8s")).toBe("kubernetes")
  })
})

describe("siteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })
  test("defaults and normalizes scheme", () => {
    vi.stubEnv("DOMAIN", undefined as unknown as string)
    expect(siteUrl().href).toBe("https://writing.natwelch.com/")
    vi.stubEnv("DOMAIN", "example.com")
    expect(siteUrl().href).toBe("https://example.com/")
    vi.stubEnv("DOMAIN", "http://localhost:8080")
    expect(siteUrl().href).toBe("http://localhost:8080/")
  })
})

describe("posts", () => {
  test("publishedPosts excludes drafts and future posts, newest first", () => {
    expect(publishedPosts().map((p) => p.id)).toEqual([3, 2, 1])
  })
  test("previous/next navigation", () => {
    expect(previousPost(2)?.id).toBe(1)
    expect(nextPost(2)?.id).toBe(3)
    expect(nextPost(3)).toBeUndefined()
  })
  test("getPostBySlug", () => {
    expect(getPostBySlug("4")?.id).toBe(4)
    expect(getPostBySlug("999")).toBeNull()
    expect(allPosts.length).toBe(5)
  })
})
