import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Hide X-Powered-By: Next.js header from scanners
  poweredByHeader: false,

  // 2. Add Security Headers (Anti-Clickjacking, XSS Protection, MIME Sniffing Protection)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
