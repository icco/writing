import { useLazyQuery } from "@apollo/client"
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import { ErrorMessage, Loading } from "@icco/react-common"
import AdminLinkList from "components/AdminLinkList"
import App from "components/App"
import EditPost from "components/EditPost"
import Header from "components/Header"
import NotAuthorized from "components/NotAuthorized"
import { getUser } from "components/User"
import Head from "next/head"
import { useRouter } from "next/router"

const Page = (props) => {
  const router = useRouter()
  let { pid } = router.query

  if (props.pid) {
    pid = props.pid
  }

  const { isLoading, error, isAuthenticated } = useAuth0()
  const [user, { loading: queryLoading, error: queryError, data: userData }] =
    useLazyQuery(getUser)

  if (isLoading || queryLoading) {
    return <Loading />
  }

  if (error || queryError) {
    return <ErrorMessage error={error} message="Unable to get page." />
  }

  if (!isAuthenticated) {
    return <NotAuthorized />
  }

  if (!userData) {
    user()
    return <Loading />
  }

  if (userData.whoami == null || userData.whoami.role != "admin") {
    console.log(userData)
    return <NotAuthorized />
  }

  return (
    <App>
      <Head>
        <title>Nat? Nat. Nat! Edit Post #{pid}</title>
      </Head>
      <Header noLogo />
      <EditPost id={pid} />
      <AdminLinkList />
    </App>
  )
}

export default withAuthenticationRequired(Page)