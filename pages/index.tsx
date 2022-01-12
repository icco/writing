import App from "components/App"
import Footer from "components/Footer"
import Header from "components/Header"
import PostList from "components/PostList"
import Head from "next/head"

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

export async function getStaticProps() {
  return {
    props: {},
  }
}

export default Index
