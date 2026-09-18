import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Фото товара уходит через серверное действие, а оно по умолчанию
      // принимает не больше мегабайта. API режет файл на десяти, плюс запас
      // на служебные байты формы.
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
