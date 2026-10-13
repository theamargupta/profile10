import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Origin isolation — keeps Trusted Types / Spectre mitigations available.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  /**
   * The Vercel build skips the TypeScript step; scripts/deploy/build-in-container.sh runs `tsc --noEmit` before
   * `vercel build` (which sets VERCEL=1), and a local `next build` still type-checks. Next 16.2.3 docs
   * (next-config-js/typescript.md): "If disabled, be sure you are running type checks as part of your build or
   * deploy process, otherwise this can be very dangerous." Spec: docs/specs/manual-prod-deploy.md
   */
  typescript: { ignoreBuildErrors: process.env.VERCEL === "1" },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "avcnoywxnkajfuobftmr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
