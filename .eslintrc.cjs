// .eslintrc.cjs

// ==============================
// Config
// ==============================
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports", "simple-import-sort", "jsx-a11y"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier",
  ],
  ignorePatterns: [
    ".next/",
    "node_modules/",
    "lib/gallery.data.ts", // fișier GENERAT
  ],
  rules: {
    // tip imports – se potrivește cu `verbatimModuleSyntax: true`
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],

    // unused
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "warn",

    // sortare importuri
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",

    // a11y mici
    "jsx-a11y/anchor-is-valid": "off",
  },
  settings: {
    next: { rootDir: ["./"] },
  },
};
