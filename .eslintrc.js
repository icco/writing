module.exports = {
  parser: "@babel/eslint-parser",
  env: {
    browser: true,
    es6: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    React: "writable",
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["react", "prettier", "react-hooks", "graphql"],
  rules: {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "prettier/prettier": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "graphql/template-strings": [
      "error",
      {
        // Import default settings for your GraphQL client. Supported values:
        // 'apollo', 'relay', 'lokka', 'fraql', 'literal'
        env: "apollo",

        // Import your schema JSON here
        schemaJson: require("./schema.json"),

        // OR provide absolute path to your schema JSON (but not if using `eslint --cache`!)
        // schemaJsonFilepath: path.resolve(__dirname, './schema.json'),

        // OR provide the schema in the Schema Language format
        // schemaString: printSchema(schema),

        // tagName is gql by default
      },
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
