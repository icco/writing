import path from "node:path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // Tests run without a content-collections build; use a small fixture set.
      "content-collections": path.resolve(
        import.meta.dirname,
        "src/test/postFixture.ts"
      ),
    },
  },
  test: {
    environment: "node",
    server: { deps: { inline: [/@icco\/react-common/] } },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/**/*.test.{ts,tsx}"],
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
})
