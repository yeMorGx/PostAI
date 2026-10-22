import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/api/editorial/posts/*/generate": ["./docs/piersec/baseline_piersec/*.md"],
    "/api/editorial/posts/*/generate-image": ["./docs/piersec/baseline_piersec/*.md"],
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
        { key: "Cache-Control", value: "private, no-store" },
      ],
    }];
  },
};
export default config;
