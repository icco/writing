import App from "components/App";
import Footer from "components/Footer";
import Header from "components/Header";
import fs from "fs";
import Head from "next/head";
import Image from "next/image";
import { join } from "path";
import Masonry from "react-masonry-component";

const imgdir = join(process.cwd(), "public/imgs/inspiration/");

const Inspiration = ({ images }) => {
  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat! Inspiration</title>
      </Head>
      <Header noLogo />
      <Masonry
        className={"cf pa2"}
        options={{ transitionDuration: 0 }}
        disableImagesLoaded={true}
      >
        {images.map((i) => (
          <div className="w-30-ns w-100 pa2" key={i}>
            <Image
              src={`/imgs/inspiration/${i}`}
              className="db w-100"
              alt={`inspiration #${i}`}
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
    if (file.endsWith(".png")) {
      images.push(file);
    }
  });

  return {
    props: { images },
    revalidate: 1,
  };
}

export default Inspiration;
