import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Значение подставляется из .env локально и из переменных Railway в проде.
    url: process.env.DATABASE_URL,
  },
});
