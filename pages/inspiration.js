import Image from 'next/image'
import Head from "next/head";
import fs from 'fs';


import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Inspiration = ({ images }) => {
  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat! Inspiration</title>
      </Head>
      <Header />

    {images.map((i) => (
      <Image src={`/imgs/${i}.png`} />
    ))}
      <Footer />
    </App>
  );
};

export async function getStaticProps() {
 let  images = []
  fs.readdirSync("../public/imgs/inspiration/").forEach(file => {
    images += file
});

  return {
    props: { images },
    revalidate: 1,
  };
}

export default Inspiration;
