export const BLOG_URL = "https://writing.natwelch.com"

export function canonicalPostUrl(permalink: string): string {
  return new URL(permalink, BLOG_URL).href
}
