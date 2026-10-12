import type { NextConfig } from "next";
import { signupEndpoint } from "./lib/signup.config";

// Stops the build with a clear message if the sign-up URL is set but malformed.
if (!signupEndpoint()) {
  console.warn("⚠ GDF_SIGNUP_URL is not set. The form will show an error until it is (see README.md).");
}

const nextConfig: NextConfig = {
  // Produces a minimal self-contained server for the Docker image.
  // Vercel ignores this setting and uses its own build output.
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
