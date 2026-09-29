import type { NextConfig } from "next";
import path from "path";

const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  transpilePackages: ['@ssdev-toolkit/forms-core', '@ssdev-toolkit/react-forms'],
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  outputFileTracingRoot: monorepoRoot,
  // Pin Turbopack root to the monorepo so `next` resolves from the workspace install
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
