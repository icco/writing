import './globals.css'

export const metadata = {
  title: 'Nat? Nat. Nat!',
  description: 'Nat Welch\'s personal blog',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
