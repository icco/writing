import { JSDOM } from "jsdom"
import parseLinkHeader from "parse-link-header"
import { safeRequest } from "./network"

export async function discoverEndpoint(target: string): Promise<string | null> {
  const res = await safeRequest(target)
  if (res.status < 200 || res.status >= 300)
    throw new Error(`Discovery failed: ${res.status}`)
  const header = parseLinkHeader(res.headers.get("link"))
  if (header?.webmention) return new URL(header.webmention.url, res.url).href
  if (
    !/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(
      res.headers.get("content-type") || ""
    )
  )
    return null
  const dom = new JSDOM(res.body, { url: res.url })
  try {
    const link = dom.window.document.querySelector(
      'link[rel~="webmention"][href], a[rel~="webmention"][href]'
    )
    return link ? new URL(link.getAttribute("href")!, res.url).href : null
  } finally {
    dom.window.close()
  }
}

export type DeliveryResult = {
  status: "accepted" | "no-endpoint" | "failed"
  endpoint?: string
  httpStatus?: number
  retryAt?: string
  error?: string
}

export async function deliverWebmention(
  source: string,
  target: string
): Promise<DeliveryResult> {
  let endpoint: string | undefined
  try {
    endpoint = (await discoverEndpoint(target)) || undefined
    if (!endpoint) return { status: "no-endpoint" }
    const response = await safeRequest(endpoint, {
      method: "POST",
      body: new URLSearchParams({ source, target }).toString(),
    })
    if (response.status >= 200 && response.status < 300)
      return { status: "accepted", endpoint, httpStatus: response.status }
    const retry = response.headers.get("retry-after")
    const next =
      retry && /^\d+$/.test(retry)
        ? Date.now() + Number(retry) * 1000
        : Date.parse(retry || "")
    const retryAt =
      [429, 503].includes(response.status) && Number.isFinite(next)
        ? new Date(
            Math.min(Math.max(next, Date.now()), Date.now() + 7 * 86400000)
          ).toISOString()
        : undefined
    return {
      status: "failed",
      endpoint,
      httpStatus: response.status,
      retryAt,
      error: `Receiver returned ${response.status}`,
    }
  } catch (error) {
    return {
      status: "failed",
      endpoint,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
