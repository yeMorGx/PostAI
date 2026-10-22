import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingExcludes: {
    "/api/editorial/posts/*/generate": ["./docs/piersec/**/*.pdf"],
    "/api/editorial/posts/*/generate-image": ["./docs/piersec/**/*.pdf"],
    "/api/editorial/cycles/*/estimate": ["./docs/piersec/**/*.pdf"],
  },
  outputFileTracingIncludes: {
    "/api/editorial/posts/*/generate": [
      "./docs/piersec/baseline_piersec/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/index.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/conceito/**/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/fontes/**/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/estrategia/**/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/acervo/**/*.md",
      "./docs/piersec/piersec-guia-base-de-conhecimento/piersec-guia-base-de-conhecimento/modelos/instrucoes-para-agentes.md",
    ],
    "/api/editorial/posts/*/generate-image": [
      "./docs/piersec/baseline_piersec/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/index.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/conceito/**/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/fontes/**/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/estrategia/**/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/acervo/**/*.md",
      "./docs/piersec/piersec-guia-base-de-conhecimento/piersec-guia-base-de-conhecimento/modelos/instrucoes-para-agentes.md",
    ],
    "/api/editorial/cycles/*/estimate": [
      "./docs/piersec/baseline_piersec/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/index.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/conceito/**/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/fontes/**/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/estrategia/**/*.md",
      "./docs/piersec/piersec-base-ciberseguranca/piersec-base-ciberseguranca/wiki/acervo/**/*.md",
      "./docs/piersec/piersec-guia-base-de-conhecimento/piersec-guia-base-de-conhecimento/modelos/instrucoes-para-agentes.md",
    ],
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
