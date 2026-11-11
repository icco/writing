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

test("captions a standalone image with its alt text", async () => {
  expect(await render("![Ada at work](/a.png)")).toBe(
    '<figure><img src="/a.png" alt="Ada at work"><figcaption aria-hidden="true">Ada at work</figcaption></figure>\n'
  )
})

test("captions an image that links to itself", async () => {
  expect(await render("[![Ada](/a.png)](/a.png)")).toBe(
    '<figure><a href="/a.png"><img src="/a.png" alt="Ada"></a><figcaption aria-hidden="true">Ada</figcaption></figure>\n'
  )
})

test("leaves images without alt text and inline images alone", async () => {
  expect(await render("![](/a.png)")).toBe('<p><img src="/a.png" alt=""></p>\n')
  expect(await render("see ![Ada](/a.png) here")).toContain("<p>see")
})
