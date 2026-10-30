/**
 * Minimal stand-in for `contentlayer/generated` used by Vitest. Only the
 * fields the app reads are populated.
 */
export type Post = {
  _id: string
  _raw: { flattenedPath: string }
  type: "Post"
  id: number
  datetime: string
  draft: boolean
  permalink: string
  title: string
  summary: string
  header_image?: string
  header_image_alt_text?: string
  social_image: string
  url: string
  github: string
  tags: string[]
  modifiedAt: string
  readingTime: number
  wordCount: number
  linkCount: number
  imageCount: number
  tagCount: number
  characterCount: number
  body: { raw: string; code: string }
}

export function makePost(overrides: Partial<Post> & { id: number }): Post {
  const { id } = overrides
  return {
    _id: `${id}.md`,
    _raw: { flattenedPath: String(id) },
    type: "Post",
    datetime: "2020-01-01T00:00:00.000Z",
    draft: false,
    permalink: `/post/${id}`,
    title: `Post ${id}`,
    summary: "",
    social_image: `/post/${id}/social.png`,
    url: `/post/${id}`,
    github: `https://github.com/icco/writing/blob/main/posts/${id}.md`,
    tags: [],
    modifiedAt: "2020-01-02T00:00:00.000Z",
    readingTime: 2,
    wordCount: 400,
    linkCount: 1,
    imageCount: 0,
    tagCount: 0,
    characterCount: 2000,
    body: { raw: "Hello", code: "" },
    ...overrides,
  }
}

export const allPosts: Post[] = [
  makePost({
    id: 1,
    datetime: "2019-05-01T00:00:00.000Z",
    tags: ["coding", "art"],
    summary: "First post",
  }),
  makePost({
    id: 2,
    datetime: "2020-06-01T00:00:00.000Z",
    tags: ["coding"],
    header_image: "https://icco.imgix.net/photos/hero.jpg",
    header_image_alt_text: "A hero",
  }),
  makePost({
    id: 3,
    datetime: "2021-07-01T00:00:00.000Z",
    tags: ["politics"],
  }),
  makePost({
    id: 4,
    datetime: "2021-08-01T00:00:00.000Z",
    draft: true,
    tags: ["secret"],
  }),
  makePost({
    id: 5,
    datetime: "2999-01-01T00:00:00.000Z",
    tags: ["future"],
  }),
]
