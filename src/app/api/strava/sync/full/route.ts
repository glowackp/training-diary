import { placeholderResponse } from "@/lib/utils/api";

/** Reserves the full Strava backfill endpoint for later ingestion work. */
export async function POST() {
  return placeholderResponse({
    message: "Full Strava sync placeholder.",
    status: 202,
  });
}
