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
              imgSrc: [
                "'self'",
                "data:",
                "http://*.static.flickr.com",
                "http://*.staticflickr.com",
                "https://*.natwelch.com",
                "https://*.static.flickr.com",
                "https://*.staticflickr.com",
                "https://icco.imgix.net",
                "https://natnatnat.imgix.net",
                "https://storage.googleapis.com",
                "https://s3.amazonaws.com",
                "https://cl.ly",
                "http://cl.ly",
                "https://i.imgur.com",
                "https://upload.wikimedia.org",
                "https://d13yacurqjgara.cloudfront.net",
                "https://j.gifs.com",
                "https://photos.smugmug.com",
                "https://*.media.tumblr.com",
                "http://*.media.tumblr.com",
                "https://static01.nyt.com",
                "https://syllabus.vox-cdn.com",
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
