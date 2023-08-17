
const TagLayout = ({ params }: { params: { slug: string } }) => {
  return (
    <>
      Tag: {params.slug}
    </>
  )
}

export default TagLayout