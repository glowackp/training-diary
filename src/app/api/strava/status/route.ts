import { getServerEnv } from "@/lib/config/env";
import { placeholderResponse } from "@/lib/utils/api";

/** Reports whether Strava credentials have been configured for local development. */
export async function GET() {
  const env = getServerEnv();

  return placeholderResponse({
    message: "Strava status placeholder.",
    data: {
      configured: Boolean(env.STRAVA_CLIENT_ID && env.STRAVA_CLIENT_SECRET),
    },
  });
}
