import dns from "node:dns/promises"
import http from "node:http"
import https from "node:https"
import { isIP } from "node:net"
import ipaddr from "ipaddr.js"

export type SafeResponse = {
  url: string
  status: number
  headers: Headers
  body: string
}
type Options = {
  method?: "GET" | "POST"
  body?: string
  headers?: Record<string, string>
}

export function isIpAllowed(ip: string): boolean {
  try {
    return ipaddr.process(ip).range() === "unicast"
  } catch {
    return false
  }
}

export async function safeRequest(
  rawUrl: string,
  options: Options = {}
): Promise<SafeResponse> {
  const signal = AbortSignal.timeout(10000)
  let url = new URL(rawUrl)
  let method = options.method || "GET"
  let body = options.body
  for (let hop = 0; hop <= 5; hop++) {
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.port
    )
      throw new Error("Unsafe destination URL")
    const hostname = url.hostname.replace(/^\[|\]$/g, "")
    const addresses = await Promise.race([
      isIP(hostname)
        ? Promise.resolve([{ address: hostname, family: isIP(hostname) }])
        : dns.lookup(hostname, { all: true }),
      new Promise<never>((_, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        })
      }),
    ])
    signal.throwIfAborted()
    if (
      !addresses.length ||
      !addresses.every((item) => isIpAllowed(item.address))
    )
      throw new Error("Blocked private or reserved address")
    const pinned = addresses[0]
    const response = await new Promise<SafeResponse>((resolve, reject) => {
      const transport = url.protocol === "https:" ? https : http
      const request = transport.request(
        url,
        {
          method,
          signal,
          agent: false,
          lookup: (_hostname, _options, callback) =>
            callback(null, pinned.address, pinned.family),
          headers: {
            "User-Agent": "writing.natwelch.com webmention sender",
            ...(body
              ? { "Content-Type": "application/x-www-form-urlencoded" }
              : {}),
          },
        },
        (res) => {
          const chunks: Buffer[] = []
          let size = 0
          res.on("error", reject)
          res.on("data", (chunk: Buffer) => {
            size += chunk.length
            if (size > 2 * 1024 * 1024)
              request.destroy(new Error("Response exceeds 2 MiB"))
            else chunks.push(chunk)
          })
          res.on("end", () => {
            const headers = new Headers()
            for (const [key, values] of Object.entries(res.headers)) {
              for (const value of Array.isArray(values)
                ? values
                : values === undefined
                  ? []
                  : [String(values)])
                headers.append(key, value)
            }
            resolve({
              url: url.href,
              status: res.statusCode || 500,
              headers,
              body: Buffer.concat(chunks).toString("utf8"),
            })
          })
        }
      )
      request.on("error", reject)
      request.end(body)
    })
    const location = response.headers.get("location")
    if (![301, 302, 303, 307, 308].includes(response.status) || !location)
      return response
    if (hop === 5) throw new Error("Too many redirects")
    url = new URL(location, url)
    if (
      response.status === 303 ||
      ((response.status === 301 || response.status === 302) &&
        method === "POST")
    ) {
      method = "GET"
      body = undefined
    }
  }
  throw new Error("Too many redirects")
}
