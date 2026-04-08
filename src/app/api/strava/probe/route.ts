import { getServerConfig } from "@/lib/config/env";
import { LOCAL_DEFAULT_OWNER_ID } from "@/lib/config/local-development";
import { getStravaActivityProbe } from "@/lib/strava/client";
import { placeholderResponse } from "@/lib/utils/api";

/** Executes a minimal authenticated Strava read so local development can verify the stored connection works. */
export async function GET() {
  const config = getServerConfig();

  if (!config.strava.isReady) {
    return placeholderResponse({
      message: "Strava authentication is not ready.",
      status: 503,
      data: {
        ready: false,
        connected: false,
        state: "not_ready",
      },
    });
  }

  const probeResult = await getStravaActivityProbe(LOCAL_DEFAULT_OWNER_ID);

  if (!probeResult.ok) {
    const status =
      probeResult.reason === "rate_limited"
        ? 429
        : probeResult.reason === "upstream_error"
          ? 502
          : 409;
    const messageMap = {
      not_connected: "Connect Strava before running the authenticated probe.",
      insufficient_scopes:
        "Reconnect Strava so the app receives the required activity scopes.",
      reauthorization_required:
        "Reconnect Strava because the stored authorization is no longer usable.",
      rate_limited: "Strava is rate limiting the probe request right now.",
      upstream_error: "The Strava probe request failed upstream.",
    } as const;

    return placeholderResponse({
      message: messageMap[probeResult.reason],
      status,
      data: {
        ready: true,
        connected: probeResult.reason !== "not_connected",
        state: probeResult.reason,
      },
    });
  }

  return placeholderResponse({
    message:
      probeResult.activities.length > 0
        ? "Strava authenticated read succeeded."
        : "Strava authenticated read succeeded but returned no activities.",
    data: {
      ready: true,
      connected: true,
      state: "connected",
      hasActivities: probeResult.activities.length > 0,
      activityCount: probeResult.activities.length,
    },
  });
}
