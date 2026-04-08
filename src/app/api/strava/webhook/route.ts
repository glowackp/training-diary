import { placeholderResponse } from "@/lib/utils/api";

/** Reserves the webhook verification endpoint for Strava subscription setup. */
export async function GET() {
  return placeholderResponse({
    message: "Strava webhook verification placeholder.",
    status: 501,
  });
}

/** Reserves the webhook delivery endpoint for future Strava event ingestion. */
export async function POST() {
  return placeholderResponse({
    message: "Strava webhook delivery placeholder.",
    status: 501,
  });
}
