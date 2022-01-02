import ErrorPage from "next/error"
import { useRouter } from "next/router"
import React from "react"

export default function Oops() {
  const router = useRouter()
  const { message } = router.query

  return <ErrorPage statusCode={500} title={message || "Unknown Error"} />
}
