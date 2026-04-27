import { Post } from "contentlayer/generated"
import Image from "next/image"

import {
  getHeaderImageAlt,
  withHeaderCropDefaults,
} from "@/lib/absoluteImageUrl"

/**
 * In-column hero: same width as the title and prose. Imgix crops the image
 * to 2:1 with a face/focal-point fallback so the result lines up with the
 * 2:1 frame and avoids browser-side cropping.
 */
export default function PostHeaderImage({ post }: { post: Post }) {
  if (!post.header_image) {
    return null
  }
  const src = withHeaderCropDefaults(post.header_image)

  return (
    <div className="not-prose mb-8 w-full max-w-full overflow-hidden rounded-2xl shadow-sm">
      <div className="relative aspect-[2/1] w-full">
        <Image
          src={src}
          alt={getHeaderImageAlt(post)}
          fill
          className="object-cover"
          priority
          sizes="(min-width: 64rem) 64rem, calc(100vw - 2rem)"
        />
      </div>
    </div>
  )
}
