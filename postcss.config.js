const preserveProperty = require("./postcss-preserve-property")

module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    preserveProperty: preserveProperty(),
    "postcss-preset-env": {
      features: {
        "custom-properties": true,
      },
    },
  },
}
