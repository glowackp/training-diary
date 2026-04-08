import { placeholderResponse } from "@/lib/utils/api";

/** Reserves the server-side entry point for starting the Strava OAuth flow. */
export async function GET() {
  return placeholderResponse({
    message: "Strava connect placeholder. OAuth exchange will stay server-side.",
    status: 501,
  });
}
