import type { NextConfig } from "next";

const medusa = (() => {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000");
    return { protocol: u.protocol.replace(":", "") as "http" | "https", hostname: u.hostname };
  } catch {
    return { protocol: "http" as const, hostname: "localhost" };
  }
})();

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    // Vercel services don't route /_next/image to the optimizer (it 404s), so serve images as-is.
    // Site images are pre-sized files in public/images.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 64, 96, 160, 256, 384],
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      medusa,
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.byshree.local" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: isProd ? securityHeaders : securityHeaders.filter((h) => h.key !== "Strict-Transport-Security"),
      },
    ];
  },
};

export default config;
