'use client' // Error components must be Client Components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  let code = 404
  let message = error.message
  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="mb-4 flex-auto">
          <h1 className="inline-block mx-2">{code}</h1><h2 className="inline-block mx-2">{message}</h2>
        </div>
      </div>
    </>
  )
}