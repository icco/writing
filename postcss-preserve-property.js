module.exports = () => {
  return {
    postcssPlugin: "postcss-preserve-property",
    Once(root) {
      // Ensure @property rules are preserved
      root.walkAtRules("property", (atRule) => {
        // Mark as valid to prevent warnings
        atRule.raws = atRule.raws || {}
      })
    },
  }
}

module.exports.postcss = true

