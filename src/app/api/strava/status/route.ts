import { getServerConfig } from "@/lib/config/env";
import { LOCAL_DEFAULT_OWNER_ID } from "@/lib/config/local-development";
import { getActiveStravaConnectionByOwnerId } from "@/lib/db/queries/strava-connections";
import { placeholderResponse } from "@/lib/utils/api";

/** Reports whether Strava auth is ready and whether the local owner has an active connection. */
export async function GET() {
  const config = getServerConfig();

  if (!config.strava.isReady) {
    return placeholderResponse({
      message: "Strava authentication is not ready.",
      data: {
        ready: false,
        connected: false,
        state: "not_ready",
      },
    });
  }

  const stravaConnection = await getActiveStravaConnectionByOwnerId(
    LOCAL_DEFAULT_OWNER_ID,
  );
  const connected = Boolean(stravaConnection);

  return placeholderResponse({
    message: connected
      ? "Strava authentication is connected."
      : "Strava authentication is ready to connect.",
    data: {
      ready: true,
      connected,
      state: connected ? "connected" : "needs_connection",
    },
  });
}
