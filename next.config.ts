import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal self-contained server for the Docker image.
  // Vercel ignores this setting and uses its own build output.
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
