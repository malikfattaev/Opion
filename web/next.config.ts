import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Каталог переехал на главную; старый адрес не должен отдавать 404.
  async redirects() {
    return [{ source: "/catalog", destination: "/", permanent: true }];
  },
};

export default nextConfig;
