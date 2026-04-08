import { getServerConfig } from "@/lib/config/env";
import { placeholderResponse } from "@/lib/utils/api";

/** Returns a lightweight health payload for local smoke testing. */
export async function GET() {
  const config = getServerConfig();

  return placeholderResponse({
    message: "Training Diary API is reachable.",
    data: {
      storageDriver: config.storage.driver,
      databaseHost: config.database.host,
    },
  });
}
