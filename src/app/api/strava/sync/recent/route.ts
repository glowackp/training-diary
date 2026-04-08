import { placeholderResponse } from "@/lib/utils/api";

/** Reserves the recent Strava sync endpoint for later incremental updates. */
export async function POST() {
  return placeholderResponse({
    message: "Recent Strava sync placeholder.",
    status: 202,
  });
}
