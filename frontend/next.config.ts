import type { NextConfig } from "next";

const devAllowedOrigin = process.env.DEV_ALLOWED_ORIGIN;

const nextConfig: NextConfig = {
  ...(devAllowedOrigin
    ? {
        allowedDevOrigins: [devAllowedOrigin],
      }
    : {}),
};

export default nextConfig;