import Error from "next/error"

export default function Page({ errorCode }) {
  const statusCode = errorCode ? errorCode : 404
  return <Error statusCode={statusCode} />
}
