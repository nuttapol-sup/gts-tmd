import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://flagcdn.com https://*.tile.openstreetmap.org https://*.google.com https://*.gstatic.com https://i.ytimg.com https://img.youtube.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://flagcdn.com https://*.tile.openstreetmap.org https://api.open-meteo.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
  "require-trusted-types-for 'script'",
].join("; ");

const nextConfig: NextConfig = {
  // 1. Hide X-Powered-By: Next.js header to prevent framework fingerprinting
  poweredByHeader: false,

  // 2. Comprehensive Security Headers (CSP, COOP, Trusted Types, HSTS, Anti-XSS, MIME Sniffing)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // 1. Content Security Policy (CSP) & Trusted Types
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          // 2. Cross-Origin Opener Policy (COOP)
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          // 3. Cross-Origin Resource Policy (CORP)
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          // 4. Anti-Clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // 5. Anti-MIME Sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // 6. Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 7. XSS Protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // 8. Permissions Policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // 9. Strict Transport Security (HSTS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
