import { fixupPluginRules } from "@eslint/compat"
import tsParser from "@typescript-eslint/parser"
import nextConfig from "eslint-config-next"

// Fix eslint-config-next for ESLint 10:
// 1. The bundled Babel parser (eslint-config-next/parser) returns a scope manager
//    without addGlobals() which ESLint 10 requires — override to @typescript-eslint/parser
// 2. eslint-plugin-react still uses context.getFilename() (removed in ESLint 10) — fix up
const nextConfigFixed = nextConfig.map((config) => {
  const result = { ...config }

  // Override Babel parser with @typescript-eslint/parser for all files
  if (result.languageOptions?.parser?.meta?.name === "eslint-config-next/parser") {
    result.languageOptions = {
      ...result.languageOptions,
      parser: tsParser,
    }
  }

  // Fix up only the React plugin for ESLint 10 compat
  if (result.plugins?.react) {
    result.plugins = {
      ...result.plugins,
      react: fixupPluginRules(result.plugins.react),
    }
  }

  return result
})

const eslintConfig = [
  {
    ignores: [".contentlayer/", ".next/", "node_modules/"],
  },
  ...nextConfigFixed,
  {
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
  // TypeScript handles undefined-variable and unused-variable checking.
  // Disable base ESLint rules for TS files to avoid false positives.
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
]

export default eslintConfig
