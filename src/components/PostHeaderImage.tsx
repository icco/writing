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
    <div
      className={[
        "not-prose mb-8 max-w-none overflow-hidden",
        /* Break out of article horizontal padding — values must match page article padding. */
        "-mx-4 w-[calc(100%+2rem)]",
        "md:-mx-6 md:w-[calc(100%+3rem)]",
        "lg:-mx-8 lg:w-[calc(100%+4rem)]",
        /* Square through tablet: rounded card only on large screens. */
        "rounded-none shadow-none",
        "lg:rounded-2xl lg:shadow-sm",
      ].join(" ")}
    >
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
