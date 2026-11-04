import type { NextConfig } from "next";

/**
 * URL do backend NestJS. Lida no servidor (Node), nunca exposta ao navegador.
 * Configure em .env.local -> API_URL=http://localhost:3000
 */
const apiUrl = process.env.API_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
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
