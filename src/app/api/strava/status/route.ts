import { getServerConfig } from "@/lib/config/env";
import { placeholderResponse } from "@/lib/utils/api";

/** Reports whether Strava credentials have been configured for local development. */
export async function GET() {
  const config = getServerConfig();

  return placeholderResponse({
    message: "Strava status placeholder.",
    data: {
      configured: config.strava.isConfigured,
    },
  });
}
