import { defineConfig } from "drizzle-kit";

/** Configures Drizzle tooling for the local PostgreSQL-first development flow. */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema/*.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/training_diary",
  },
});
