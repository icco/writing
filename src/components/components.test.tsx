import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, test, vi } from "vitest"

import { makePost } from "@/test/contentlayerFixture"

vi.mock("next-contentlayer2/hooks", () => ({
  useMDXComponent:
    () =>
    ({ components }: { components: Record<string, React.FC<never>> }) => {
      const A = components.a as unknown as React.FC<{
        href: string
        children: React.ReactNode
      }>
      return <A href="/x">mdx-link</A>
    },
}))

vi.mock("@icco/react-common/SiteHeader", () => ({
  SiteHeader: ({ links }: { links: Array<{ href: string; name: string }> }) => (
    <nav>
      {links.map((l) => (
        <a key={l.href} href={l.href}>
          {l.name}
        </a>
      ))}
    </nav>
  ),
}))

vi.mock("@icco/react-common/Footer", () => ({
  Footer: ({ sourceRepo }: { sourceRepo: string }) => (
    <footer>{sourceRepo}</footer>
  ),
}))

import Footer from "./Footer"
import Header from "./Header"
import { MDXContent } from "./MDXContent"
import MusicEmbed from "./MusicEmbed"
import PhotoGrid from "./PhotoGrid"
import { PostCard } from "./PostCard"
import PostHeaderImage from "./PostHeaderImage"
import { PostStats } from "./PostStats"
import { allTags, allTagsWithCounts, Tag } from "./Tag"

const html = (el: React.ReactElement) => renderToStaticMarkup(el)

describe("components", () => {
  test("Header and Footer render", () => {
    expect(html(<Header />)).toContain("/stats")
    expect(html(<Footer />)).toContain("github.com/icco/writing")
  })

  test("MDXContent wires custom link component", () => {
    expect(html(<MDXContent code="" />)).toContain('href="/x"')
  })

  test("MusicEmbed resolves sources and optional parts", () => {
    const full = html(
      <MusicEmbed
        src="./audio/a.mp3?x=1"
        srcOgg="b.ogg"
        title="Song"
        caption="Cap"
        transcriptUrl="/t"
        preload="none"
      />
    )
    expect(full).toContain('src="/audio/a.mp3?x=1"')
    expect(full).toContain('type="audio/mpeg"')
    expect(full).toContain('src="/audio/b.ogg"')
    expect(full).toContain("aria-labelledby")
    expect(full).toContain("Cap")
    expect(full).toContain("Transcript")
    const bare = html(<MusicEmbed src="/x/track.unknown" />)
    expect(bare).toContain('aria-label="Embedded audio"')
    expect(bare).toContain('type="audio/mpeg"')
    expect(bare).not.toContain("Transcript")
  })

  test("PhotoGrid builds imgix srcsets", () => {
    const out = html(
      <PhotoGrid
        urls={[
          "https://icco.imgix.net/a.jpg?w=5&auto=format",
          "https://e.com/b.jpg",
          "relative.jpg",
        ]}
        alts={["first"]}
      />
    )
    expect(out).toContain("images.natwelch.com/a.jpg?auto=format&amp;w=640")
    expect(out).toContain("auto=format%2Ccompress")
    expect(out).toContain('src="relative.jpg"')
    expect(out).toContain('alt="first"')
    expect(out).toContain('alt="Grid item 3"')
  })

  test("PostCard shows draft, summary, and tags", () => {
    const out = html(
      <PostCard
        {...makePost({
          id: 7,
          draft: true,
          summary: "Sum",
          tags: ["dev"],
        })}
      />
    )
    expect(out).toContain("DRAFT")
    expect(out).toContain("Sum")
    expect(out).toContain("/tag/coding")
    const plain = html(<PostCard {...makePost({ id: 8 })} />)
    expect(plain).not.toContain("DRAFT")
  })

  test("PostHeaderImage only renders with a header image", () => {
    expect(html(<PostHeaderImage post={makePost({ id: 1 })} />)).toBe(
      ""
    )
    const out = html(
      <PostHeaderImage
        post={
          makePost({
            id: 1,
            header_image: "https://icco.imgix.net/h.jpg",
            header_image_alt_text: "Hero",
          })
        }
      />
    )
    expect(out).toContain('alt="Hero"')
  })

  test("PostStats formats reading time", () => {
    expect(
      html(<PostStats post={makePost({ id: 1, readingTime: 0.5 })} />)
    ).toContain("&lt;1 min")
    expect(
      html(<PostStats post={makePost({ id: 1, readingTime: 2.2 })} />)
    ).toContain("3 min")
  })

  test("Tag helpers ignore drafts and future posts", () => {
    expect(allTags()).toEqual(["art", "coding", "politics"])
    expect(allTagsWithCounts()).toEqual([
      { tag: "art", count: 1 },
      { tag: "coding", count: 2 },
      { tag: "politics", count: 1 },
    ])
    expect(html(<Tag tag="humor" count={3} />)).toContain("#comedy")
    expect(html(<Tag tag="x" />)).not.toContain("rounded-full")
  })
})
