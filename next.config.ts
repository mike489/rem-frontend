import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The repo root also has a package-lock.json (root helper scripts); pin the app root
  // to this folder so Next doesn't guess the wrong workspace root.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Property photos are uploaded through a Server Action (up to 12 × 5 MB, checked by Laravel).
    // Both limits default to 1 MB / 10 MB, which is too small for a batch of photos.
    serverActions: { bodySizeLimit: "64mb" },
    proxyClientMaxBodySize: "64mb",
  },
};

export default nextConfig;
