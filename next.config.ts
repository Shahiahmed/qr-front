import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // We have no single root layout to compose a 404 from: the site lives under
    // the top-level dynamic segment `[locale]`, and `/m` is a separate root. So
    // unmatched URLs are served by `app/global-not-found.tsx`, which renders its
    // own full HTML document. See node_modules/next/dist/docs .../not-found.md.
    globalNotFound: true,
  },
};

export default nextConfig;
