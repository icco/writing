import generateFeed from "lib/feed"

const Feed = () => {
  return ""
}

export async function getServerSideProps(context) {
  const ret = { props: {} }
  const res = context.res
  if (!res) {
    return ret
  }
  let feed = await generateFeed()
  res.setHeader("Content-Type", "application/atom+xml")
  res.write(feed.atom1())
  res.end()

  return ret
}

export default Feed
