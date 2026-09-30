import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // Served at /admin on the shared domain (vercel.json rewrite passes the full path through).
  basePath: "/admin",
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default config;
