export default function Pre({ children }) {
  return (
    <pre className="p-4 overflow-x-auto bg-gray-800 text-white rounded-md">
      {children}
    </pre>
  )
}