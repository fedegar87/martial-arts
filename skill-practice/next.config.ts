import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // La cache persistente ha ripubblicato CSS obsoleto dopo modifiche a globals.css.
  experimental: { turbopackFileSystemCacheForBuild: false },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default createNextIntlPlugin("./src/lib/i18n/request.ts")(nextConfig);
