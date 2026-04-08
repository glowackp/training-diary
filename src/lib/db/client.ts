import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getServerConfig } from "@/lib/config/env";

type GlobalDatabase = typeof globalThis & {
  trainingDiaryPool?: Pool;
};

const globalDatabase = globalThis as GlobalDatabase;
const config = getServerConfig();

const pool =
  globalDatabase.trainingDiaryPool ??
  new Pool({
    connectionString: config.database.url,
  });

if (config.nodeEnv !== "production") {
  globalDatabase.trainingDiaryPool = pool;
}

/** Exposes the shared Drizzle client used by future queries and route handlers. */
export const db = drizzle(pool);
