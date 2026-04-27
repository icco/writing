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
