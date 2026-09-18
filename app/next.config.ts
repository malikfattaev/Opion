import type { NextConfig } from "next";

/**
 * Фотографии товаров отдаёт сервис API, а оптимизатор картинок пускает только
 * на явно разрешённые домены. Берём его из того же адреса, что и каталог.
 */
const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");

const productImages = {
  protocol: api.protocol.replace(":", "") as "http" | "https",
  hostname: api.hostname,
  port: api.port,
  pathname: "/images/**",
} as const;

const nextConfig: NextConfig = {
  images: { remotePatterns: [productImages] },
};

export default nextConfig;
