import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Environment-aware Content Security Policy (CSP)
// Specific non-wildcard domains for OWASP ZAP compliance
const cspDirectives = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:"
    : "script-src 'self' 'unsafe-inline' https:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://flagcdn.com https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://maps.googleapis.com https://maps.gstatic.com https://www.google.com https://www.gstatic.com https://i.ytimg.com https://img.youtube.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://flagcdn.com https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://api.open-meteo.com ws: wss:",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
];

const cspHeader = cspDirectives.join("; ");

const nextConfig: NextConfig = {
  // Fast Build Optimizations
  typescript: {
    ignoreBuildErrors: true,
  },

  // 1. Hide X-Powered-By: Next.js header to prevent framework fingerprinting
  poweredByHeader: false,

  // 2. Comprehensive Security Headers (CSP, COOP, CORP, COEP, Anti-Clickjacking, Anti-XSS, HSTS, Cache-Control)
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          // 1. Content Security Policy (CSP)
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          // 2. Cross-Origin Opener Policy (COOP)
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          // 3. Cross-Origin Resource Policy (CORP)
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          // 4. Cross-Origin Embedder Policy (COEP)
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          // 5. Anti-Clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // 6. Anti-MIME Sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // 7. Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 8. Anti-XSS Protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // 9. Permissions Policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // 10. HTTP Strict Transport Security (HSTS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // 11. Explicit Cache-Control for OWASP ZAP Compliance
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
