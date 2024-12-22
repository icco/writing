import { allTags, Tag } from "@/components/Tag"

const TagList = () => {
  return (
    <>
      <h1 className="text-4xl font-bold text-center my-8">Tags</h1>
      <div className="mx-auto max-w-3xl px-8 py-7">
        {allTags().map((tag) => (
          <Tag key={tag} tag={tag} className="text-xl p-4" />
        ))}
      </div>
    </>
  )
}

export default TagList
