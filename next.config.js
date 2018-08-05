// https://github.com/zeit/next-plugins/tree/master/packages/next-mdx
const withMDX = require("@zeit/next-mdx")({
  extension: /\.mdx?$/
});
module.exports = withMDX({
  pageExtensions: ["js", "jsx", "mdx"]
});

// https://github.com/zeit/next-plugins/tree/master/packages/next-css
const withCSS = require("@zeit/next-css");
module.exports = withCSS({
  cssModules: true
});

// https://github.com/zeit/next-plugins/tree/master/packages/next-source-maps
const withSourceMaps = require("@zeit/next-source-maps");
module.exports = withSourceMaps({
  webpack(config, options) {
    return config;
  }
});
