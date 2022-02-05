import App from "components/App"
import Footer from "components/Footer"
import Header from "components/Header"
import PostList from "components/PostList"
import Head from "next/head"

const components = { ExampleComponent }

interface Props {
  mdxSource: MDXRemoteSerializeResult
}

export default function Index({ mdxSource }: Props) {
  return (
    <div>
      <MDXRemote {...mdxSource} components={components} />
    </div>
  )
}

const Index = () => {
  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat!</title>
        <meta
          name="Description"
          content="Nat Welch's blog about life and software."
        />
      </Head>
      <Header noLogo={undefined} />
      <PostList />
      <Footer />
    </App>
  )
}

export const getStaticProps: GetStaticProps<
  MDXRemoteSerializeResult
> = async () => {
  const mdxSource = await serialize("some *mdx* content: <ExampleComponent />")
  return { props: { mdxSource } }
}
