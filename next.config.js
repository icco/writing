// @ts-check

const { createSecureHeaders } = require("next-secure-headers")
const { withContentlayer } = require("next-contentlayer2")

const port = process.env.PORT || "8080"
const hostname = process.env.HOSTNAME || `localhost`
const domain = process.env.DOMAIN || `http://${hostname}:${port}`

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  trailingSlash: false,
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  images: {
    // Send <Image> requests directly to imgix instead of re-optimising via
    // /_next/image. See src/lib/imgixLoader.ts.
    loader: "custom",
    loaderFile: "./src/lib/imgixLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "icco.imgix.net",
        pathname: "/**",
      },
    ],
  },
  env: {
    DOMAIN: domain,
    PORT: port,
  },
  async redirects() {
    return [
      {
        source: "/about",
        destination: "https://natwelch.com/wiki/about",
        permanent: true,
      },
      {
        source: "/tag",
        destination: "/tags",
        permanent: true,
      },
      {
        source: "/posts/:slug",
        destination: "/post/:slug",
        permanent: true,
      },
      {
        source: "/tags/:tag",
        destination: "/tag/:tag",
        permanent: true,
      },
      {
        source: "/:id(\\d+)",
        destination: "/post/:id",
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "NEL",
            value: JSON.stringify({ report_to: "default", max_age: 2592000 }),
          },
          {
            key: "Report-To",
            value: JSON.stringify({
              group: "default",
              max_age: 10886400,
              endpoints: [
                { url: `https://reportd.natwelch.com/report/writing` },
              ],
            }),
          },
          {
            key: "Reporting-Endpoints",
            value: 'default="https://reportd.natwelch.com/reporting/writing"',
          },
        ],
      },
      {
        source: "/(.*)",
        headers: createSecureHeaders({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'none'"],
              connectSrc: [
                "https://*.natwelch.com",
                domain,
                domain.replace(/^https?/, "ws"),
              ],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              // Every body image now flows through `prepare-posts.ts` and ends
              // up on icco.imgix.net (proxied through photos.natwelch.com), so
              // the CSP allow-list only needs the canonical hosts.
              imgSrc: [
                "'self'",
                "data:",
                "https://*.natwelch.com",
                "https://icco.imgix.net",
              ],
              scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "blob:",
                "https://*.natwelch.com",
                "https://embedr.flickr.com",
                "https://widgets.flickr.com",
                "https://platform.twitter.com",
                "https://s.imgur.com",
                domain,
              ],
              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com/",
              ],
              frameSrc: [
                "https://www.youtube.com",
                "https://www.youtube-nocookie.com",
                "https://render.githubusercontent.com",
              ],
              // <audio> / <video> do not inherit from img-src; without media-src they fall back to default-src.
              mediaSrc: ["'self'"],
              objectSrc: ["'none'"],
              // https://developers.google.com/web/updates/2018/09/reportingapi#csp
              reportURI: "https://reportd.natwelch.com/report/writing",
              reportTo: "default",
            },
            reportOnly: false,
          },
          referrerPolicy: "strict-origin-when-cross-origin",
          expectCT: true,
        }),
      },
    ]
  },
  experimental: {
    mdxRs: true,
  },
  turbopack: {},
}

module.exports = withContentlayer(nextConfig)
