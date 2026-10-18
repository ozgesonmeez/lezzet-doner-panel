import type { NextConfig } from "next";

const devAllowedOrigin = process.env.DEV_ALLOWED_ORIGIN;

const nextConfig: NextConfig = {
  ...(devAllowedOrigin
    ? {
        allowedDevOrigins: [devAllowedOrigin],
      }
    : {}),

  async redirects() {
    return [
      {
        source: "/panel",
        destination: "https://lezzet-doner-panel.vercel.app/",
        permanent: false,
      },
      {
        source: "/panel/:path*",
        destination: "https://lezzet-doner-panel.vercel.app/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
