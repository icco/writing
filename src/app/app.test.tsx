import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, test, vi } from "vitest"

const draft = vi.hoisted(() => ({ isEnabled: false, enable: vi.fn() }))

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT ${url}`)
  }),
}))
vi.mock("next/headers", () => ({ draftMode: async () => draft }))
vi.mock("next/font/google", () => {
  const font = () => ({ variable: "font-var" })
  return { Roboto: font, Roboto_Slab: font, Roboto_Mono: font }
})
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(
      public element: React.ReactElement,
      public options: Record<string, unknown>
    ) {}
  },
}))
vi.mock("@icco/react-common/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))
vi.mock("@icco/react-common/WebVitals", () => ({ WebVitals: () => null }))
vi.mock("@/components/MDXContent", () => ({
  MDXContent: () => <div>mdx-body</div>,
}))
vi.mock("@/components/Header", () => ({ default: () => <header /> }))
vi.mock("@/components/Footer", () => ({ default: () => <footer /> }))
vi.mock("./globals.css", () => ({}))

import { GET as draftGET } from "./api/draft/route"
import { GET as ogGET } from "./api/og/route"
import Drafts from "./drafts/page"
import { GET as atomGET } from "./feed.atom/route"
import { GET as rssGET } from "./feed.rss/route"
import RootLayout, { metadata as rootMetadata } from "./layout"
import Home from "./page"
import ErrorPage from "./post/[slug]/error"
import PostLayout, {
  generateMetadata as postMetadata,
  generateStaticParams as postParams,
} from "./post/[slug]/page"
import { GET as postsJsonGET } from "./posts.json/route"
import sitemap from "./sitemap"
import StatsPage from "./stats/page"
import TagLayout, {
  generateMetadata as tagMetadata,
  generateStaticParams as tagParams,
} from "./tag/[slug]/page"
import TagList from "./tags/page"
import YearLayout, {
  generateMetadata as yearMetadata,
  generateStaticParams as yearParams,
} from "./year/[year]/page"
import YearsList from "./years/page"

const html = (el: React.ReactNode) =>
  renderToStaticMarkup(el as React.ReactElement)
const params = <T,>(p: T) => ({ params: Promise.resolve(p) })

beforeEach(() => {
  draft.isEnabled = false
  draft.enable.mockClear()
})

describe("static pages", () => {
  test("home, drafts, tags, years, stats", () => {
    expect(html(<Home />)).toContain("Post 3")
    const d = html(<Drafts />)
    expect(d).toContain("Post 4")
    expect(d).not.toContain("Post 1<")
    expect(html(<TagList />)).toContain("#politics")
    expect(html(<YearsList />)).toContain("/year/2021")
    const stats = html(<StatsPage />)
    expect(stats).toContain("Total Posts")
    expect(stats).toContain('href="/year/2019"')
  })

  test("root layout", () => {
    expect(rootMetadata.title).toBe("Nat? Nat. Nat!")
    const out = html(<RootLayout>child</RootLayout>)
    expect(out).toContain("main-content")
    expect(out).toContain("child")
  })

  test("error page maps digests", () => {
    const cases: Array<[string | undefined, string]> = [
      ["NEXT_NOT_FOUND", "404"],
      ["NEXT_UNAUTHORIZED", "401"],
      ["NEXT_FORBIDDEN", "403"],
      ["NEXT_BAD_REQUEST", "400"],
      ["NEXT_UNAVAILABLE", "503"],
      [undefined, "500"],
    ]
    for (const [digest, code] of cases) {
      const error = Object.assign(new Error("x"), { digest })
      expect(html(<ErrorPage error={error} reset={() => {}} />)).toContain(
        code
      )
    }
  })

  test("sitemap", () => {
    const urls = sitemap().map((e) => e.url)
    expect(urls).toContain("http://localhost:8080/post/1")
    expect(urls).toContain("http://localhost:8080/tag/coding")
    expect(urls).toContain("http://localhost:8080/year/2020")
    expect(urls).not.toContain("http://localhost:8080/post/4")
  })
})

describe("post page", () => {
  test("static params and metadata", async () => {
    expect((await postParams()).map((p) => p.slug)).toEqual(["3", "2", "1"])
    const md = await postMetadata(params({ slug: "2" }))
    expect(md.title).toBe("#2 Post 2")
    expect(md.openGraph.images[0].alt).toBe("A hero")
    await expect(postMetadata(params({ slug: "999" }))).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
  })

  test("renders with prev/next and header image", async () => {
    const out = html(await PostLayout(params({ slug: "2" })))
    expect(out).toContain("mdx-body")
    expect(out).toContain('title="Post 1"')
    expect(out).toContain('title="Post 3"')
    expect(out).toContain("BlogPosting")
    expect(out).toContain('alt="A hero"')
  })

  test("summary appears in JSON-LD", async () => {
    expect(html(await PostLayout(params({ slug: "1" })))).toContain(
      '"description":"First post"'
    )
  })

  test("drafts require draft mode", async () => {
    await expect(PostLayout(params({ slug: "4" }))).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
    await expect(PostLayout(params({ slug: "999" }))).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
    draft.isEnabled = true
    expect(html(await PostLayout(params({ slug: "4" })))).toContain("DRAFT")
  })
})

describe("tag page", () => {
  test("params and metadata", async () => {
    const slugs = (await tagParams()).map((p) => p.slug)
    expect(slugs).toContain("coding")
    expect(slugs).toContain("k8s")
    expect((await tagMetadata(params({ slug: "Humor" }))).title).toContain(
      "#comedy"
    )
  })

  test("renders, redirects aliases, and 404s empty tags", async () => {
    expect(html(await TagLayout(params({ slug: "coding" })))).toContain(
      "Post 2"
    )
    await expect(TagLayout(params({ slug: "dev" }))).rejects.toThrow(
      "REDIRECT /tag/coding"
    )
    await expect(TagLayout(params({ slug: "nothing" }))).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
  })
})

describe("year page", () => {
  test("params and metadata", async () => {
    expect((await yearParams()).map((p) => p.year).sort()).toEqual([
      "2019",
      "2020",
      "2021",
    ])
    expect((await yearMetadata(params({ year: "2020" }))).title).toContain(
      "2020"
    )
  })

  test("renders and 404s", async () => {
    expect(html(await YearLayout(params({ year: "2021" })))).toContain(
      "Post 3"
    )
    await expect(YearLayout(params({ year: "abc" }))).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
    await expect(YearLayout(params({ year: "1990" }))).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
  })
})

describe("route handlers", () => {
  test("feeds", async () => {
    const rss = await rssGET()
    expect(rss.headers.get("Content-Type")).toBe("application/rss+xml")
    expect(await rss.text()).toContain("<rss")
    const atom = await atomGET()
    expect(atom.headers.get("Content-Type")).toBe("application/atom+xml")
  })

  test("posts.json", async () => {
    const body = await (await postsJsonGET()).json()
    expect(body.map((p: { id: number }) => p.id)).toEqual([3, 2, 1])
    expect(body[0]).not.toHaveProperty("body")
  })

  test("og image", async () => {
    const fetchMock = vi.fn(async () => ({
      arrayBuffer: async () => new ArrayBuffer(1),
    }))
    vi.stubGlobal("fetch", fetchMock)
    const withDate = (await ogGET({
      nextUrl: new URL("https://x/api/og?title=Hi&date=2020"),
    } as never)) as unknown as { element: React.ReactElement }
    expect(html(withDate.element)).toContain("2020")
    const noParams = (await ogGET({
      nextUrl: new URL("https://x/api/og"),
    } as never)) as unknown as { element: React.ReactElement }
    expect(html(noParams.element)).toContain("Nat Welch&#x27;s Blog")
    vi.unstubAllGlobals()
  })

  test("draft mode", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.stubEnv("SECRET_TOKEN", "s")
    const call = (q: string) => draftGET(new Request(`https://x/api/draft?${q}`))
    expect((await call("secret=bad&slug=1")).status).toBe(401)
    expect((await call("secret=s")).status).toBe(400)
    expect((await call("secret=s&slug=999")).status).toBe(401)
    const ok = await call("secret=s&slug=4")
    expect(ok.status).toBe(307)
    expect(ok.headers.get("Location")).toBe("/post/4")
    expect(draft.enable).toHaveBeenCalled()
    draft.enable.mockImplementationOnce(() => {
      throw new Error("boom")
    })
    expect((await call("secret=s&slug=4")).status).toBe(500)
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })
})
