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
          ...require("daisyui/src/theming/themes")["nord"],
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dracula"],
        },
      },
    ],
    logs: false,
  },
}
export default config
