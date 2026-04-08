import { getServerConfig } from "@/lib/config/env";
import { getLocalDevelopmentSummary } from "@/lib/config/local-development";
import { placeholderResponse } from "@/lib/utils/api";

/** Returns a lightweight health payload for local smoke testing. */
export async function GET() {
  const config = getServerConfig();
  const localDevelopment = getLocalDevelopmentSummary(config);

  return placeholderResponse({
    message: "Training Diary API is reachable.",
    data: {
      nodeEnv: config.nodeEnv,
      storageDriver: config.storage.driver,
      databaseHost: config.database.host,
      localUploadDirectory: localDevelopment.localUploadDirectory,
      seedOwnerId: localDevelopment.seedOwnerId,
      stravaConfigured: localDevelopment.stravaConfigured,
    },
  });
}
