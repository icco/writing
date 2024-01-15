"use client"

import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light")
      }}
    >
      Change Theme
    </button>
  )
}

export default ThemeToggle
