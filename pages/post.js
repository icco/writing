import App from '../components/App'
import Header from '../components/Header'
import Post from '../components/Post'
import {withRouter} from 'next/router'

const Page = withRouter((props) => (
  <App>
    <Header />
    <Post id={props.router.query.id} />
  </App>
))

export default Page
