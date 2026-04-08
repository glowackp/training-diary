import { getServerConfig } from "@/lib/config/env";
import { LOCAL_DEFAULT_OWNER_ID } from "@/lib/config/local-development";
import { getActiveStravaConnectionByOwnerId } from "@/lib/db/queries/strava-connections";
import { hasRequiredStravaScopes } from "@/lib/strava/oauth";
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
        canReadActivities: false,
        state: "not_ready",
      },
    });
  }

  const stravaConnection = await getActiveStravaConnectionByOwnerId(
    LOCAL_DEFAULT_OWNER_ID,
  );

  if (!stravaConnection) {
    return placeholderResponse({
      message: "Strava authentication is ready to connect.",
      data: {
        ready: true,
        connected: false,
        canReadActivities: false,
        state: "needs_connection",
      },
    });
  }

  const canReadActivities = hasRequiredStravaScopes(stravaConnection.scopes);

  return placeholderResponse({
    message: canReadActivities
      ? "Strava authentication is connected and ready for activity reads."
      : "Strava authentication needs reconnect to restore the required activity scopes.",
    data: {
      ready: true,
      connected: true,
      canReadActivities,
      state: canReadActivities ? "connected" : "insufficient_scopes",
    },
  });
}
