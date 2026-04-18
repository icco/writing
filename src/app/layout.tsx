import "./globals.css"

import type { Metadata, Viewport } from "next"
import { Roboto, Roboto_Mono, Roboto_Slab } from "next/font/google"

import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { ThemeProvider } from "@icco/react-common/ThemeProvider"
import { WebVitals } from "@icco/react-common/WebVitals"

const roboto = Roboto({
  weight: "400",
  variable: "--font-roboto",
  subsets: ["latin"],
})

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.DOMAIN ?? "https://writing.natwelch.com"
  ),
  title: "Nat? Nat. Nat!",
  description: "The personal blog of Nat Welch",
  other: {
    webmention: "https://webmention.io/writing.natwelch.com/webmention",
    pingback: "https://webmention.io/writing.natwelch.com/xmlrpc",
    charset: "utf-8",
  },
}

export const viewport: Viewport = {
  viewportFit: "cover",
  initialScale: 1.0,
  width: "device-width",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoSlab.variable} ${robotoMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider defaultTheme="system" enableSystem>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-base-100 focus:px-4 focus:py-2 focus:text-base-content"
          >
            Skip to main content
          </a>
          <Header />
          <WebVitals analyticsPath="/analytics/writing" />
          <main id="main-content">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
