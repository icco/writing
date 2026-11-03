import { JSDOM } from "jsdom"
import LinkHeader from "http-link-header"
import { MIMEType } from "whatwg-mimetype"
import { safeRequest, type SafeResponse } from "./network"

export class DiscoveryError extends Error {
  httpStatus: number
  retryAt?: string
  constructor(response: SafeResponse) {
    super(`Discovery failed: ${response.status}`)
    this.httpStatus = response.status
    this.retryAt = retryAtFor(response)
  }
}

function retryAtFor(response: SafeResponse): string | undefined {
  if (![429, 503].includes(response.status)) return undefined
  const retry = response.headers.get("retry-after")
  const next =
    retry && /^\d+$/.test(retry)
      ? Date.now() + Number(retry) * 1000
      : Date.parse(retry || "")
  if (!Number.isFinite(next)) return undefined
  return new Date(
    Math.min(Math.max(next, Date.now()), Date.now() + 7 * 86400000)
  ).toISOString()
}

function linkEndpoint(value: string | null): string | undefined {
  try {
    return LinkHeader.parse(value || "").rel("webmention")[0]?.uri
  } catch (error) {
    console.warn("Ignoring malformed Link header", error)
    return undefined
  }
}

export async function discoverEndpoint(target: string): Promise<string | null> {
  const res = await safeRequest(target)
  if (res.status < 200 || res.status >= 300) throw new DiscoveryError(res)
  const header = linkEndpoint(res.headers.get("link"))
  if (header !== undefined) return new URL(header, res.url).href
  const type = MIMEType.parse(res.headers.get("content-type") || "")
  if (!type || !["text/html", "application/xhtml+xml"].includes(type.essence))
    return null
  const dom = new JSDOM(res.body, { url: res.url })
  try {
    const link = dom.window.document.querySelector(
      'link[rel~="webmention"][href], a[rel~="webmention"][href]'
    )
    return link ? new URL(link.getAttribute("href")!, link.baseURI).href : null
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
    return {
      status: "failed",
      endpoint,
      httpStatus: response.status,
      retryAt: retryAtFor(response),
      error: `Receiver returned ${response.status}`,
    }
  } catch (error) {
    return {
      status: "failed",
      endpoint,
      ...(error instanceof DiscoveryError
        ? { httpStatus: error.httpStatus, retryAt: error.retryAt }
        : {}),
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
