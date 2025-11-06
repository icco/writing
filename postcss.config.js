import preserveProperty from "./postcss-preserve-property.js"

export default {
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
