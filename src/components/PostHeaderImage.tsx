import { Post } from "contentlayer/generated"
import Image from "next/image"

import { getHeaderImageAlt } from "@/lib/absoluteImageUrl"

/**
 * Full-width “cover” under the post max-width: breaks out of article `px-8` so
 * the image spans the full content column, with a short viewport-relative height.
 */
export default function PostHeaderImage({ post }: { post: Post }) {
  if (!post.header_image) {
    return null
  }

  return (
    <div className="not-prose -mx-8 mb-8 w-[calc(100%+4rem)] max-w-none overflow-hidden rounded-2xl shadow-sm">
      <div className="relative h-[min(40vh,380px)] w-full sm:h-[min(45vh,480px)]">
        <Image
          src={post.header_image}
          alt={getHeaderImageAlt(post)}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 80rem) 100vw, 80rem"
        />
      </div>
    </div>
  )
}
