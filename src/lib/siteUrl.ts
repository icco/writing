const FALLBACK = "https://writing.natwelch.com"

export function siteUrl(): URL {
  const raw = process.env.DOMAIN ?? FALLBACK
  return new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`)
}
