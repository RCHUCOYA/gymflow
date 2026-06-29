import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    // Fallback local para comandos que no requieren conexion real durante CI.
    url: process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/gymflow?schema=public"
  }
});
