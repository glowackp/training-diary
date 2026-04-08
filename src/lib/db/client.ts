import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getServerEnv } from "@/lib/config/env";

type GlobalDatabase = typeof globalThis & {
  trainingDiaryPool?: Pool;
};

const globalDatabase = globalThis as GlobalDatabase;
const env = getServerEnv();

const pool =
  globalDatabase.trainingDiaryPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
  });

if (env.NODE_ENV !== "production") {
  globalDatabase.trainingDiaryPool = pool;
}

/** Exposes the shared Drizzle client used by future queries and route handlers. */
export const db = drizzle(pool);
