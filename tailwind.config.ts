import type { Config } from "tailwindcss"

const config: Config = {
  future: {},
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          ...require("daisyui/src/theming/themes")["nord"],
        },
        dark: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          ...require("daisyui/src/theming/themes")["nord"],
          "primary": "#3B4252",
          "secondary": "#434C5E",
          "accent": "#81A1C1",
          "neutral": "#4C566A",
          "base-100": "#2E3440",
          "info": "#5E81AC",
          "success": "#A3BE8C",
          "warning": "#D08770",
          "error": "#BF616A",
        },
        },
    ],
    logs: false,
  },
}
export default config
