import { afterEach, expect, test, vi } from "vitest"
import { emptyReactions, getWebmentions } from "./webmentions"

const mention = (id: number, property: string | undefined = "in-reply-to") => ({
  "wm-id": id,
  "wm-property": property,
  "wm-private": false,
  "wm-received": "2026-01-02T00:00:00Z",
  url: `https://example.com/${id}`,
  author: {
    name: "Reader",
    url: "https://example.com",
    photo: "https://avatars.webmention.io/a.png",
  },
  content: { text: "Hi <script>", html: "<script>bad</script>" },
})
const response = (children: unknown[], pages = 1) =>
  Response.json({ children, paging: { "total-pages": pages } })
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test("groups public records and deduplicates paged aliases", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      response(
        [
          mention(1),
          mention(2, "like-of"),
          mention(3, "repost-of"),
          mention(4, "bookmark-of"),
          mention(5, "mention-of"),
          { ...mention(6), "wm-private": true },
          mention(7, "rsvp"),
        ],
        2
      )
    )
    .mockResolvedValueOnce(
      response([mention(1), { ...mention(8), "wm-property": undefined }], 2)
    )
  vi.stubGlobal("fetch", fetcher)
  const groups = await getWebmentions(7, "/post/7")
  expect(
    Object.values(groups).map((group) => group.map((item) => item.id))
  ).toEqual([[2], [3], [4], [1], [5, 8]])
  expect(groups.replies[0].text).toBe("Hi <script>")
  const url = new URL(fetcher.mock.calls[0][0])
  expect(url.searchParams.getAll("target[]")).toEqual([
    "https://writing.natwelch.com/post/7",
    "https://writing.natwelch.com/7",
    "https://writing.natwelch.com/posts/7",
  ])
  expect(new URL(fetcher.mock.calls[1][0]).searchParams.get("page")).toBe("1")
  expect(fetcher.mock.calls[0][1].next.revalidate).toBe(3600)
  expect(fetcher.mock.calls[0][1].signal).toBe(fetcher.mock.calls[1][1].signal)
})

test("untrusted fields cannot supply scripts, credentials, private photos or invalid times", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        response([
          { ...mention(1), url: "javascript:bad" },
          {
            ...mention(2),
            author: {
              name: 12,
              url: "https://user:pass@example.com",
              photo: "https://evil.com/a",
            },
            published: "bad",
            "wm-received": "bad",
          },
          {
            ...mention(3),
            author: null,
            url: null,
            "wm-source": "https://example.com/source",
            content: { html: "<b>no text</b>" },
          },
          null,
          { "wm-id": "bad" },
        ])
      )
  )
  const groups = await getWebmentions(1, "/post/1")
  expect(groups.replies.map((item) => item.id)).toEqual([2, 3])
  expect(groups.replies[0]).toMatchObject({ author: { name: "Anonymous" } })
  expect(groups.replies[0].author.url).toBeUndefined()
  expect(groups.replies[0].author.photo).toBeUndefined()
  expect(groups.replies[0].published).toBeUndefined()
  expect(groups.replies[1]).toMatchObject({
    url: "https://example.com/source",
    text: "",
  })
})

test("sorts using valid published date and replaces deleted records on refresh", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        response([
          { ...mention(1), published: "2026-02-01T00:00:00Z" },
          mention(2),
        ])
      )
      .mockResolvedValueOnce(response([mention(2)]))
  )
  expect(
    (await getWebmentions(1, "/post/1")).replies.map((item) => item.id)
  ).toEqual([2, 1])
  expect(
    (await getWebmentions(1, "/post/1")).replies.map((item) => item.id)
  ).toEqual([2])
})

test.each([
  new Response("bad", { status: 503 }),
  new Response("not json"),
  Response.json({}),
  response([mention(1)], 11),
])("fails closed for unavailable or incomplete snapshots", async (res) => {
  vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res))
  expect(await getWebmentions(1, "/post/1")).toEqual(emptyReactions())
})

test("network errors do not break pages", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))
  expect(await getWebmentions(1, "/post/1")).toEqual(emptyReactions())
})
