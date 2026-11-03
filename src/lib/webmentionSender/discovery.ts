import { JSDOM } from "jsdom"
import { safeRequest } from "./network"

export async function discoverEndpoint(targetUrl: string): Promise<string | null> {
  try {
    const res = await safeRequest(targetUrl, { method: "GET" })
    const linkHeader = res.headers.get("Link")
    if (linkHeader) {
      for (const part of linkHeader.split(",")) {
        const match = part.match(/<([^>]+)>;\s*rel="([^"]*)"/i)
        if (match) {
          const [, url, rel] = match
          if (rel.split(/\s+/).includes("webmention")) {
            return new URL(url, targetUrl).href
          }
        }
      }
    }
    const contentType = res.headers.get("Content-Type") || ""
    const dom = new JSDOM(res.body, { url: targetUrl })
    const links = dom.window.document.querySelectorAll("link[rel~='webmention'], a[rel~='webmention']")
    for (const link of links) {
      const href = link.getAttribute("href")
      if (href) return new URL(href, targetUrl).href
    }
  } catch {
    return null
  }
  return null
}


export async function deliverWebmention(source: string, target: string): Promise<{ status: "accepted" | "no-endpoint" | "failed"; endpoint?: string; httpStatus?: number; retryAt?: string }> {
  const endpoint = await discoverEndpoint(target)
  if (!endpoint) return { status: "no-endpoint" }
  try {
    const body = new URLSearchParams({ source, target }).toString()
    const res = await safeRequest(endpoint, { method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded" } })
    if (res.status >= 200 && res.status < 300) return { status: "accepted", endpoint, httpStatus: res.status }
    let retryAt: string | undefined
    if (res.status === 429 || res.status === 503) {
      const retryHeader = res.headers.get("Retry-After")
      if (retryHeader) {
        const seconds = parseInt(retryHeader, 10)
        if (!isNaN(seconds)) retryAt = new Date(Date.now() + seconds * 1000).toISOString()
        else retryAt = retryHeader
      }
    }
    return { status: "failed", endpoint, httpStatus: res.status, retryAt }
  } catch (error) {
    return { status: "failed", endpoint, httpStatus: 500 }
  }
}

