import Link from "next/link"

import { allTags } from "@/lib/hashtags"

const TagList = () => {
  return (
    <>
      <h1 className="text-4xl font-bold text-center my-8">Tags</h1>
      <div className="mx-auto max-w-3xl px-8 py-7">
        {allTags().map((tag) => (
          <Link key={tag} href={`/tag/${tag}`}>
            {tag}
          </Link>
        ))}
      </div>
    </>
  )
}

export default TagList
