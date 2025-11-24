import { allTagsWithCounts, Tag } from "@/components/Tag"

const TagList = () => {
  return (
    <>
      <h1 className="my-8 text-center text-4xl font-bold">Tags</h1>
      <div className="mx-auto max-w-3xl px-8 py-7">
        {allTagsWithCounts().map(({ tag, count }) => (
          <Tag key={tag} tag={tag} count={count} className="p-4 text-xl" />
        ))}
      </div>
    </>
  )
}

export default TagList
