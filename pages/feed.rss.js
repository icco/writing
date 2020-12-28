import generateFeed from "../lib/feed";

const Feed = () => {
  return "";
};

export async function getServerSideProps(context) {
  const ret = { props: {} };
  const res = context.res;
  if (!res) {
    return ret;
  }
  let feed = await generateFeed();
  res.setHeader("Content-Type", "application/rss+xml");
  res.write(feed.rss2());
  res.end();

  return ret;
}

export default Feed;
