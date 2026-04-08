import { getServerEnv } from "@/lib/config/env";
import { placeholderResponse } from "@/lib/utils/api";

/** Returns a lightweight health payload for local smoke testing. */
export async function GET() {
  const env = getServerEnv();
  const databaseUrl = new URL(env.DATABASE_URL);

  return placeholderResponse({
    message: "Training Diary API is reachable.",
    data: {
      storageDriver: env.STORAGE_DRIVER,
      databaseHost: databaseUrl.host,
    },
  });
}
