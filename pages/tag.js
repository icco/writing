import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Tag from "../components/Tag";
import { withRouter } from "next/router";

const Page = withRouter(props => (
  <App>
    <Header />
    <Tag id={props.router.query.id} />
    <Footer />
  </App>
));

export default Page;
