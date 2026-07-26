import { Post } from "contentlayer/generated"

/** For JSON-LD and feeds: `social_image` is either a full URL or a root-relative path. */
export function toAbsoluteImageUrl(socialImage: string, siteOrigin: string) {
  if (socialImage.startsWith("https://") || socialImage.startsWith("http://")) {
    return socialImage
  }
  const base = siteOrigin.replace(/\/$/, "")
  const path = socialImage.startsWith("/") ? socialImage : `/${socialImage}`
  return `${base}${path}`
}

/** When a custom `header_image` is set, prefer `header_image_alt_text`; else post title. */
export function getHeaderImageAlt(post: Post) {
  if (post.header_image) {
    const t = post.header_image_alt_text?.trim()
    if (t) return t
  }
  return post.title
}

/**
 * For imgix-hosted hero images, set sensible cropping defaults so the image
 * fits a 2:1 cover frame and centers on a face when one is detected. Any
 * params the author already set (e.g. fp-x, ar, crop) are preserved.
 */
export function withHeaderCropDefaults(src: string): string {
  let u: URL
  try {
    u = new URL(src)
  } catch {
    return src
  }
  if (!u.hostname.endsWith(".imgix.net")) {
    return src
  }
  const defaults: Record<string, string> = {
    ar: "2:1",
    fit: "crop",
    crop: "faces,focalpoint",
    "fp-x": "0.5",
    "fp-y": "0.5",
  }
  for (const [k, v] of Object.entries(defaults)) {
    if (!u.searchParams.has(k)) {
      u.searchParams.set(k, v)
    }
  }
  return u.toString()
}
