import ErrorPage from "next/error"
import { useRouter } from "next/router"
import React from "react"

export default function Oops() {
  const router = useRouter()
  const { message } = router.query

  let issue: string = "Unknown Error"
  if (message) {
    issue = message.toString()
  }
    
  return <ErrorPage statusCode={500} title={issue} />
}
