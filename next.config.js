const { createSecureHeaders } = require("next-secure-headers");

const port = process.env.PORT || 8080;
const domain = process.env.DOMAIN || `http://localhost:${port}`;
const graphql =
  process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql";

module.exports = {
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  productionBrowserSourceMaps: true,
  env: {
    AUTH0_CLIENT_ID: "MwFD0COlI4F4AWvOZThe1psOIletecnL",
    AUTH0_DOMAIN: "icco.auth0.com",
    DOMAIN: domain,
    GRAPHQL_ORIGIN: graphql,
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
              defaultSrc: [
                "'none'",
              ],
              // connect-src https://graphql.natwelch.com/graphql https://icco.auth0.com/oauth/token
              connectSrc: [
                "https://*.natwelch.com",
                "https://icco.auth0.com",
              ],
              // font-src https://fonts.gstatic.com
              fontSrc: ["https://fonts.gstatic.com"],
              // frame-src https://icco.auth0.com
              frameSrc: [
                "https://icco.auth0.com",
              ],
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
                "https://*.natwelch.com",
              ],
              // style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/
              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com/",
              ],
              objectSrc: ["'none'"],
              // https://developers.google.com/web/updates/2018/09/reportingapi#csp
              reportUri: "https://reportd.natwelch.com/report/writing",
              reportTo: "default",
            },
          },
          referrerPolicy: "strict-origin-when-cross-origin",
          expectCT: true,
        }),
      },
    ];
  },
};
