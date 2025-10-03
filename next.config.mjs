// next.config.mjs

// ==============================
// Imports
// ==============================
import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";
const withVanillaExtract = createVanillaExtractPlugin();

import withPWAInit from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

// ==============================
// PWA gating
// ==============================
const IS_PROD = process.env.NODE_ENV === "production";
const ENABLE_PWA = process.env.NEXT_PUBLIC_ENABLE_PWA === "1" && IS_PROD;

const withPWA = withPWAInit({
  dest: "public",
  disable: !ENABLE_PWA,
  register: false,
  skipWaiting: true,
  runtimeCaching,
  fallbacks: { document: "/_offline" },
  buildExcludes: [/\/_next\/dynamic-css-manifest\.json$/],
});

// ==============================
// Next.js config
// ==============================
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [48, 96, 160, 240, 320, 480, 640, 820],
    remotePatterns: process.env.NEXT_PUBLIC_ASSET_BASE
      ? (() => {
          try {
            const u = new URL(process.env.NEXT_PUBLIC_ASSET_BASE);
            return [
              { protocol: u.protocol.replace(":", ""), hostname: u.hostname, pathname: "/**" },
            ];
          } catch {
            return [];
          }
        })()
      : [],
  },

  // ⬇️ MUTAT din experimental → root (evită warning-ul)
  modularizeImports: {
    // import { format } from "date-fns"   -> "date-fns/format"
    "date-fns": { transform: "date-fns/{{member}}" },
    // import { debounce } from "lodash"   -> "lodash/debounce"
    lodash: { transform: "lodash/{{member}}" },
    // dacă folosești lodash-es
    "lodash-es": { transform: "lodash-es/{{member}}" },
  },

  experimental: {
    optimizeCss: IS_PROD,
  },

  eslint: {
    dirs: ["pages", "components", "lib", "styles", "scripts"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

// ==============================
// Export
// ==============================
export default withPWA(withVanillaExtract(nextConfig));
