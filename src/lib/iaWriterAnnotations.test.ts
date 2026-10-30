import { remark } from "remark"
import { expect, test } from "vitest"
import { remarkStripAnnotations, stripAnnotations } from "./iaWriterAnnotations"

const annotated = `Hello there.

---
Annotations: 0,2330 SHA-256 d2dffa1532704b4155ec
@Ada Lovelace <example.com>: 75,5 186 193,369
...
`

test("removes a trailing iA Writer annotation block", () => {
  expect(stripAnnotations(annotated)).toBe("Hello there.\n\n")
})

test("keeps other thematic breaks and mentions of annotations", () => {
  const body = "One\n\n---\n\nAnnotations: 2 are fine\n\n---\n\nTwo\n"
  expect(stripAnnotations(body)).toBe(body)
})

test("keeps content between an ordinary annotations paragraph and the block", () => {
  const body = "One\n\n---\n\nAnnotations: 2 are fine\n\nTwo\n"
  expect(stripAnnotations(body + "\n" + annotated)).toBe(
    body + "\nHello there.\n\n"
  )
})

test("keeps ordinary content that ends in an ellipsis", () => {
  const body = "One\n\n---\n\nAnnotations: 2 are fine\n\nTwo\n...\n"
  expect(stripAnnotations(body)).toBe(body)
})

test("removes the block before the parser sees it", async () => {
  const output = await remark().use(remarkStripAnnotations).process(annotated)
  expect(String(output)).toBe("Hello there.\n")
})
