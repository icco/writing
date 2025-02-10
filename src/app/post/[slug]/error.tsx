"use client" // Error components must be Client Components

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  let code = 0
  let message = ""

  switch (error.digest) {
    case "NEXT_NOT_FOUND":
      code = 404
      message = "Not Found"
      break
    case "NEXT_UNAUTHORIZED":
      code = 401
      message = "Unauthorized"
      break
    case "NEXT_FORBIDDEN":
      code = 403
      message = "Forbidden"
      break
    case "NEXT_BAD_REQUEST":
      code = 400
      message = "Bad Request"
      break
    case "NEXT_UNAVAILABLE":
      code = 503
      message = "Service Unavailable"
      break
    default:
      code = 500
      message = "Internal Server Error"
      break
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="mb-4 flex-auto">
          <h1 className="mx-2 inline-block">{code}</h1>
          <h2 className="mx-2 inline-block">{message}</h2>
        </div>
      </div>
    </>
  )
}
