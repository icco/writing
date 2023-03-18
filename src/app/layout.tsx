import "./globals.css"

import { Nord } from "@icco/react-common"
import { ThemeProvider } from "theme-ui"

export const metadata = {
  title: "Nat? Nat. Nat!",
  description: "Nat Welch's personal blog",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={Nord.theme}>{children}</ThemeProvider>
      </body>
    </html>
  )
}
