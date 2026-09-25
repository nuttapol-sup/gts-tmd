import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Environment-aware Content Security Policy (CSP)
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: ws: wss:",
  "frame-src 'self' https:",
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

  // Exclude data directories from build tracing to prevent scanning 600,000+ files during build
  outputFileTracingExcludes: {
    "*": [
      "./FTP/**/*",
      "./About/**/*",
      "./doc/**/*",
      "./Thailand NOC/**/*",
    ],
  },

  // 1. Hide X-Powered-By: Next.js header to prevent framework fingerprinting
  poweredByHeader: false,

  // 2. Comprehensive Security Headers (CSP, COOP, Anti-Clickjacking, Anti-XSS, HSTS)
  async headers() {
    return [
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
          // 3. Anti-Clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // 4. Anti-MIME Sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // 5. Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 6. Anti-XSS Protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // 7. Permissions Policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // 8. HTTP Strict Transport Security (HSTS)
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
