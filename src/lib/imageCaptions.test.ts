import { remark } from "remark"
import remarkHtml from "remark-html"
import { expect, test } from "vitest"
import { remarkImageCaptions } from "./imageCaptions"

const render = async (md: string) =>
  String(
    await remark()
      .use(remarkImageCaptions)
      .use(remarkHtml, { sanitize: false })
      .process(md)
  )

test("captions a standalone titled image", async () => {
  expect(await render('![Ada at work](/a.png "Ada Lovelace, 1843")')).toBe(
    '<figure><img src="/a.png" alt="Ada at work"><figcaption>Ada Lovelace, 1843</figcaption></figure>\n'
  )
})

test("leaves untitled and inline images alone", async () => {
  expect(await render("![Ada](/a.png)")).toBe(
    '<p><img src="/a.png" alt="Ada"></p>\n'
  )
  expect(await render('see ![Ada](/a.png "t") here')).toContain("<p>see")
})
