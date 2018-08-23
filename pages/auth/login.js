import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Head from "next/head";
import { show } from '../../lib/lock'

const CONTAINER_ID = 'put-lock-here'

export default class Login extends Document {
  componentDidMount () {
    show(CONTAINER_ID)
  }

  render () {
    return (
  <App>
    <Head>
      <title>Nat? Nat. Nat! | About</title>
    </Head>
    <Header />
      <div id={CONTAINER_ID} />
      </App>
    )
  }
}
