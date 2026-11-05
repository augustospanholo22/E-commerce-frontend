import type { NextConfig } from "next";

/**
 * URL do backend NestJS. Lida no servidor (Node), nunca exposta ao navegador.
 * Configure em .env.local -> API_URL=http://localhost:3000
 */
const apiUrl = process.env.API_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /** Cabeçalhos de segurança para as páginas do site */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  /**
   * O backend não habilita CORS. Por isso o navegador nunca chama a porta 3000
   * diretamente: ele chama /api/... no próprio Next, que repassa (proxy) a
   * requisição para o NestJS. Ex.: /api/produtos -> http://localhost:3000/produtos
   */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
