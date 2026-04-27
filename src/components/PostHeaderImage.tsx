import { Post } from "contentlayer/generated"
import Image from "next/image"

import { getHeaderImageAlt } from "@/lib/absoluteImageUrl"

export default function PostHeaderImage({ post }: { post: Post }) {
  if (!post.header_image) {
    return null
  }

  return (
    <div className="not-prose mt-4 w-full md:mt-0 md:max-w-md md:shrink-0">
      <Image
        src={post.header_image}
        alt={getHeaderImageAlt(post)}
        width={800}
        height={600}
        className="h-auto w-full rounded-lg"
        priority
        sizes="(max-width: 768px) 100vw, 360px"
      />
    </div>
  )
}
