// https://github.com/zeit/next-plugins/tree/master/packages/next-css
const withCSS = require("@zeit/next-css");
const port = process.env.PORT || 8080;
const withOffline = require("next-offline");
module.exports = withOffline(
  withCSS({
    env: {
      GRAPHQL_ORIGIN:
        process.env.GRAPHQL_ORIGIN || "https://graphql.natwelch.com/graphql",
      AUTH0_CLIENT_ID: "MwFD0COlI4F4AWvOZThe1psOIletecnL",
      AUTH0_DOMAIN: "icco.auth0.com",
      DOMAIN: process.env.DOMAIN || `http://localhost:${port}`,
      PORT: port,
    },
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "offlineCache",
          expiration: {
            maxEntries: 200,
          },
        },

        plugins: [
          // Other plugins...

          new WorkboxPlugin.GenerateSW({
            // Do not precache images
            exclude: [/\.(?:png|jpg|jpeg|svg)$/],

            // Define runtime caching rules.
            runtimeCaching: [
              {
                // Match any request that ends with .png, .jpg, .jpeg or .svg.
                urlPattern: /\.(?:png|jpg|jpeg|svg)$/,

                // Apply a cache-first strategy.
                handler: "CacheFirst",

                options: {
                  // Use a custom cache name.
                  cacheName: "images",

                  // Only cache 10 images.
                  expiration: {
                    maxEntries: 10,
                  },
                },
              },
            ],
          }),
        ],
      },
    ],
  })
);
