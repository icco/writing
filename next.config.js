const port = process.env.PORT || 8080;
module.exports = {
    trailingSlash: true,
  env: {
    GRAPHQL_ORIGIN: process.env.GRAPHQL_ORIGIN,
    AUTH0_CLIENT_ID: "MwFD0COlI4F4AWvOZThe1psOIletecnL",
    AUTH0_DOMAIN: "icco.auth0.com",
    DOMAIN: process.env.DOMAIN || `http://localhost:${port}`,
    PORT: port,
  },
  async redirects() {
    return [
      {
        source: '/about',
        destination: 'https://natwelch.com/',
        permanent: true
      }
    ]
  },
};
