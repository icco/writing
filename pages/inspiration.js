import Head from "next/head";
import fs from "fs";
import { join } from "path";
import Masonry from 'react-masonry-component';

import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";

const imgdir = join(process.cwd(), "public/imgs/inspiration/");

const Inspiration = ({ images }) => {
  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat! Inspiration</title>
      </Head>
      <Header noLogo />
    <Masonry
                className={'cf pa2'}
                options={{ transitionDuration: 0 }}
                disableImagesLoaded={false} // default false
                updateOnEachImageLoad={true} // default false and works only if disableImagesLoaded is false
            >
      {images.map((i) => (
        <div className="fl w-50 w-25-l pa2">
        <img
          src={`/imgs/inspiration/${i}`}
          className="db w-100"
        />
    </div>
      ))}
            </Masonry>
      <Footer />
    </App>
  );
};

export async function getStaticProps() {
  let images = [];
  fs.readdirSync(imgdir).forEach((file) => {
    if (file.endsWith('.png')) {
      images.push(file);
    }
  });

  return {
    props: { images },
    revalidate: 1,
  };
}

export default Inspiration;
