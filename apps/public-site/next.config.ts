import type { NextConfig } from "next";
import path from "path";

const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  transpilePackages: ['@nabarun-ngo/forms-core', '@nabarun-ngo/forms-react'],
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
