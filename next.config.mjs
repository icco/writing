import { createSecureHeaders } from "next-secure-headers";
import { withContentlayer } from 'next-contentlayer'

const port = process.env.PORT || 8080;
const domain = process.env.DOMAIN || `http://localhost:${port}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  trailingSlash: false,
  swcMinify: true,
  env: {
    DOMAIN: domain,
    PORT: port,
  },
  async redirects() {
    return [
      {
        source: "/about",
        destination: "https://natwelch.com/",
        permanent: true,
      },
    ];
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
        ],
      },
      {
        source: "/(.*)",
        headers: createSecureHeaders({
          contentSecurityPolicy: {
            directives: {
              // default-src 'none'
              defaultSrc: ["'none'"],
              // connect-src https://graphql.natwelch.com/graphql
              connectSrc: ["https://*.natwelch.com", domain, domain.replace(/^https?/, "ws"),],
              // font-src https://fonts.gstatic.com
              fontSrc: ["https://fonts.gstatic.com"],
              // img-src 'self' data: https://icco.imgix.net https://storage.googleapis.com
              imgSrc: [
                "'self'",
                "data:",
                "https://icco.imgix.net",
                "https://storage.googleapis.com",
                "https://*.natwelch.com",
              ],
              // script-src 'self' 'unsafe-inline'
              scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "blob:",
                "https://*.natwelch.com",
                domain,
              ],
              // style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/
              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com/",
              ],
              objectSrc: ["'none'"],
              // https://developers.google.com/web/updates/2018/09/reportingapi#csp
              reportURI: "https://reportd.natwelch.com/report/writing",
              reportTo: "default",
            },
            reportOnly: true,
          },
          referrerPolicy: "strict-origin-when-cross-origin",
          expectCT: true,
        }),
      },
    ];
  },
};

export default withContentlayer(nextConfig)