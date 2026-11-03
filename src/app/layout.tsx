import "./globals.css"

import type { Metadata, Viewport } from "next"
import { Roboto, Roboto_Mono, Roboto_Slab } from "next/font/google"

import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { siteUrl } from "@/lib/siteUrl"
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
  metadataBase: siteUrl(),
  title: "Nat? Nat. Nat!",
  description: "The personal blog of Nat Welch",
  other: {
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
        <ThemeProvider>
          <a
            href="#main-content"
            className="focus:bg-base-100 focus:text-base-content sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:px-4 focus:py-2"
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
