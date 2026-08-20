import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Environment-aware Content Security Policy (CSP)
// In Development mode: Allow 'unsafe-eval' so React Dev Overlay & Turbopack HMR debug callstacks work seamlessly without dev errors
// In Production mode: Exclude 'unsafe-eval' for maximum OWASP ZAP & security compliance
const cspDirectives = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:"
    : "script-src 'self' 'unsafe-inline' https:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://flagcdn.com https://*.tile.openstreetmap.org https://*.google.com https://*.gstatic.com https://i.ytimg.com https://img.youtube.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://flagcdn.com https://*.tile.openstreetmap.org https://api.open-meteo.com ws: wss:",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
];

const cspHeader = cspDirectives.join("; ");

const nextConfig: NextConfig = {
  // 1. Hide X-Powered-By: Next.js header to prevent framework fingerprinting
  poweredByHeader: false,

  // 2. Comprehensive Security Headers (CSP, COOP, CORP, Anti-Clickjacking, Anti-XSS)
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
          // 7. Anti-XSS Protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // 8. Permissions Policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
