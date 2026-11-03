import { createRequire } from "node:module"
import { expect, test } from "vitest"
const require = createRequire(import.meta.url)
const config = require("../../next.config.js")

test("discovery headers advertise endpoints without replacing image configuration", async () => {
  const rules = await config.headers()
  const headers = rules.flatMap((rule: { headers: { key: string; value: string }[] }) => rule.headers)
  expect(headers.find((item: { key: string }) => item.key === "Link").value).toContain('<https://webmention.io/writing.natwelch.com/webmention>; rel="webmention"')
  expect(headers.find((item: { key: string }) => item.key === "X-Pingback").value).toBe("https://webmention.io/writing.natwelch.com/xmlrpc")
  expect(config.images.remotePatterns).toEqual([{ protocol: "https", hostname: "images.natwelch.com", pathname: "/**" }])
  const csp = headers.find((item: { key: string }) => item.key.toLowerCase() === "content-security-policy").value
  expect(csp).toMatch(/img-src[^;]*https:\/\/avatars.webmention.io/)
})
