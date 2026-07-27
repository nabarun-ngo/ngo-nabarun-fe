import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // These rules are intentionally disabled for this project:
    // - no-html-link-for-pages: navigation is data-driven (content.json nav/footer
    //   links, hash anchors, mixed internal/external), so plain <a> is used.
    // - no-img-element: the site uses `output: 'export'` with unoptimized images,
    //   so <img> (with explicit width/height/alt/loading) is intentional.
    // - no-css-tags: Bootstrap + the template stylesheet are loaded via <link>.
    // All other lint rules (unused vars, hooks, TypeScript) remain enabled.
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-css-tags": "off",
    },
  },
];

export default eslintConfig;
