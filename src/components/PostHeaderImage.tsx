import { Post } from "contentlayer/generated"
import Image from "next/image"

import { getHeaderImageAlt } from "@/lib/absoluteImageUrl"

/**
 * In-column hero: same width as the title and prose (article padding, no
 * full-bleed). Rounded on all viewports.
 */
export default function PostHeaderImage({ post }: { post: Post }) {
  if (!post.header_image) {
    return null
  }

  return (
    <div className="not-prose mb-8 w-full max-w-full overflow-hidden rounded-2xl shadow-sm">
      <div className="relative h-[min(40vh,22rem)] w-full min-h-[10rem] sm:h-[min(45vh,26rem)]">
        <Image
          src={post.header_image}
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
