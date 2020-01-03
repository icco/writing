// https://github.com/zeit/next-plugins/tree/master/packages/next-css
const withCSS = require("@zeit/next-css");
module.exports = withCSS({
  env: {
    GRAPHQL_ORIGIN: process.env.GRAPHQL_ORIGIN,
  },
});
