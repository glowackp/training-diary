import { NextRequest } from "next/server";
import { placeholderResponse } from "@/lib/utils/api";

/** Receives the Strava OAuth callback once the integration is implemented. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  return placeholderResponse({
    message: "Strava callback placeholder.",
    status: 501,
    data: {
      codePresent: Boolean(url.searchParams.get("code")),
      statePresent: Boolean(url.searchParams.get("state")),
    },
  });
}
