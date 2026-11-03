import dns from "node:dns/promises"
import http from "node:http"
import https from "node:https"
import { URL } from "node:url"

export type SafeResponse = { url: string; status: number; headers: Headers; body: string }

export function isIpAllowed(ip: string): boolean {
  if (!ip || typeof ip !== "string") return false
  const clean = ip.replace(/^::ffff:/i, "")
  if (clean === "127.0.0.1" || clean === "::1" || clean === "0.0.0.0") return false
  if (clean.startsWith("10.") || clean.startsWith("192.168.") || clean.startsWith("169.254.")) return false
  const parts = clean.split(".")
  if (parts.length === 4) {
    const first = parseInt(parts[0], 10)
    const second = parseInt(parts[1], 10)
    if (first === 172 && second >= 16 && second <= 31) return false
  }
  if (clean.toLowerCase().startsWith("fc") || clean.toLowerCase().startsWith("fd") || clean.toLowerCase().startsWith("fe8")) return false
  return true
}

export async function safeRequest(rawUrl: string, options?: { method?: "GET" | "POST"; body?: string; headers?: Record<string, string> }): Promise<SafeResponse> {
  const url = new URL(rawUrl)
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Invalid protocol or credentials")
  if (url.port && url.port !== (url.protocol === "https:" ? "443" : "80")) throw new Error("Nonstandard port rejected")

  const addresses = await dns.resolve4(url.hostname).catch(() => [] as string[])
  const addresses6 = await dns.resolve6(url.hostname).catch(() => [] as string[])
  const all = [...addresses, ...addresses6]
  if (!all.length || !all.every(isIpAllowed)) throw new Error("Blocked private or unresolvable IP")
  const pinnedIp = all[0]

  const method = options?.method || "GET"
  const headers = { "User-Agent": "writing.natwelch.com webmention sender", ...options?.headers }
  if (options?.body && !headers["Content-Type"]) headers["Content-Type"] = "application/x-www-form-urlencoded"

  return new Promise((resolve, reject) => {
    const lib = url.protocol === "https:" ? https : http
    const req = lib.request({
      hostname: pinnedIp,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: { ...headers, Host: url.hostname },
      timeout: 10000,
    }, res => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        return reject(new Error("Redirects handled manually"))
      }
      let body = ""
      res.on("data", chunk => {
        body += chunk
        if (body.length > 2 * 1024 * 1024) {
          req.destroy(new Error("Response body exceeded 2 MiB limit"))
        }
      })
      res.on("end", () => {
        const responseHeaders = new Headers()
        for (const [key, val] of Object.entries(res.headers)) {
          if (Array.isArray(val)) for (const v of val) responseHeaders.append(key, v)
          else if (typeof val === "string") responseHeaders.set(key, val)
        }
        resolve({ url: rawUrl, status: res.statusCode || 500, headers: responseHeaders, body })
      })
    })
    req.on("error", reject)
    req.on("timeout", () => { req.destroy(new Error("Request timeout")) })
    if (options?.body) req.write(options.body)
    req.end()
  })
}
