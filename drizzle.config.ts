import type { Config } from "drizzle-kit";

export default {
  schema: "./src/server/dal/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
