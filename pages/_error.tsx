import { NextPageContext } from "next"
import ErrorPage from "next/error"

function Error({ statusCode }) {
  return <ErrorPage statusCode={statusCode} />
}

Error.getInitialProps = ({
  res,
  err,
}: NextPageContext): { statusCode: number } => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
