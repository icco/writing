import { allTags, Tag } from "@/components/Tag"

const TagList = () => {
  return (
    <>
      <h1 className="my-8 text-center text-4xl font-bold">Tags</h1>
      <div className="mx-auto max-w-3xl px-8 py-7">
        {allTags().map((tag) => (
          <Tag key={tag} tag={tag} className="p-4 text-xl" />
        ))}
      </div>
    </>
  )
}

export default TagList
