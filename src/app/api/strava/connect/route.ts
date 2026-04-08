import { NextResponse } from "next/server";
import { getServerConfig } from "@/lib/config/env";
import { LOCAL_DEFAULT_OWNER_ID } from "@/lib/config/local-development";
import {
  STRAVA_STATE_COOKIE_NAME,
  STRAVA_STATE_MAX_AGE_SECONDS,
} from "@/lib/strava/constants";
import { buildStravaAuthorizeUrl } from "@/lib/strava/oauth";
import { createStravaOAuthState } from "@/lib/strava/oauth-state";

function buildSettingsRedirect(reason: string) {
  return new URL(
    `/settings?strava=${encodeURIComponent(reason)}`,
    getServerConfig().app.baseUrl,
  );
}

/** Starts the Strava OAuth flow and binds the request to a signed, httpOnly state cookie. */
export async function GET() {
  const config = getServerConfig();

  if (!config.strava.isReady) {
    return NextResponse.redirect(buildSettingsRedirect("not-ready"));
  }

  const state = createStravaOAuthState(LOCAL_DEFAULT_OWNER_ID);
  const response = NextResponse.redirect(buildStravaAuthorizeUrl(state));

  response.cookies.set({
    name: STRAVA_STATE_COOKIE_NAME,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: config.nodeEnv === "production",
    path: "/api/strava",
    maxAge: STRAVA_STATE_MAX_AGE_SECONDS,
  });

  return response;
}
