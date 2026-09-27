import { expect, test } from "vitest"
import { migrateImageUrls, remarkImageUrls } from "./imageUrls"
import imageLoader from "./imgixLoader"

test("publishes legacy Markdown, HTML, and MDX image URLs on the owned domain", () => {
  const tree = { children: [
    { type: "image", url: "https://icco.imgix.net/photos/a.heic" },
    { type: "html", value: '<a href="https://icco.imgix.net/photos/a.heic">original</a>' },
    { type: "mdxJsxAttribute", value: { value: '["https://icco.imgix.net/photos/b.jpg"]' } },
  ] }
  remarkImageUrls()(tree)
  expect(JSON.stringify(tree)).not.toContain("icco.imgix.net")
  expect(migrateImageUrls("https://example.com/a.jpg")).toBe("https://example.com/a.jpg")
})

test("responsive loader keeps focal points while replacing legacy image origin", () => {
  const result = new URL(imageLoader({ src: "https://icco.imgix.net/photos/a.jpg?fp-x=0.3", width: 640, quality: 75 }))
  expect(result.hostname).toBe("images.natwelch.com")
  expect(result.searchParams.get("fp-x")).toBe("0.3")
  expect(result.searchParams.get("w")).toBe("640")
})
