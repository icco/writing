import dns from "node:dns/promises"
import { isIP } from "node:net"
import got, { type NormalizedOptions } from "got"
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
  const validateDestination = async (request: NormalizedOptions) => {
    const url = request.url!
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
    request.dnsLookup = (_hostname, lookupOptions, callback) => {
      if (lookupOptions.all) callback(null, [pinned] as never)
      else callback(null, pinned.address, pinned.family)
    }
  }
  const response = got.stream(rawUrl, {
    method: options.method || "GET",
    body: options.body,
    headers: {
      "user-agent": "writing.natwelch.com Webmention sender",
      ...(options.body
        ? { "content-type": "application/x-www-form-urlencoded" }
        : {}),
    },
    signal,
    timeout: { request: 10000 },
    retry: { limit: 0 },
    maxRedirects: 5,
    throwHttpErrors: false,
    agent: { http: false, https: false },
    hooks: {
      beforeRequest: [validateDestination],
      beforeRedirect: [validateDestination],
    },
  })
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of response) {
    const buffer = Buffer.from(chunk)
    size += buffer.length
    if (size > 2 * 1024 * 1024) {
      response.destroy()
      throw new Error("Response exceeds 2 MiB")
    }
    chunks.push(buffer)
  }
  const headers = new Headers()
  for (const [key, values] of Object.entries(response.response!.headers)) {
    for (const value of Array.isArray(values)
      ? values
      : values === undefined
        ? []
        : [String(values)])
      headers.append(key, value)
  }
  return {
    url: response.response!.url,
    status: response.response!.statusCode,
    headers,
    body: Buffer.concat(chunks).toString("utf8"),
  }
}
