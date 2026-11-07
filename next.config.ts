import type { NextConfig } from "next";

// Exportação estática: o build gera a pasta `out/`, que pode ir para qualquer hospedagem
// (Hostinger, Vercel, GitHub Pages). A API em .NET da fase 2 roda separada, em api.ideraldo.com.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
