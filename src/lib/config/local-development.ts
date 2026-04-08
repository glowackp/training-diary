import type { ServerConfig } from "@/lib/config/env";
import { getServerConfig } from "@/lib/config/env";
import type { OwnerId } from "@/types/owner";

export const LOCAL_DEFAULT_OWNER_ID: OwnerId = "local-default";

/** Returns safe local bootstrap hints that can be reused by scripts, docs, and lightweight health checks. */
export function getLocalDevelopmentSummary(config: ServerConfig = getServerConfig()) {
  return {
    seedOwnerId: LOCAL_DEFAULT_OWNER_ID,
    storageDriver: config.storage.driver,
    localUploadDirectory: config.storage.localUploadDirectory,
    stravaConfigured: config.strava.isConfigured,
  } as const;
}
