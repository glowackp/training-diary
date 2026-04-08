import { NextRequest, NextResponse } from "next/server";
import { getServerConfig } from "@/lib/config/env";
import { LOCAL_DEFAULT_OWNER_ID } from "@/lib/config/local-development";
import { persistStravaConnection } from "@/lib/strava/connections";
import { STRAVA_STATE_COOKIE_NAME } from "@/lib/strava/constants";
import {
  exchangeStravaAuthorizationCode,
  hasRequiredStravaScopes,
} from "@/lib/strava/oauth";
import { validateStravaOAuthState } from "@/lib/strava/oauth-state";

function buildSettingsRedirect(reason: string) {
  return new URL(
    `/settings?strava=${encodeURIComponent(reason)}`,
    getServerConfig().app.baseUrl,
  );
}

function redirectToSettings(reason: string) {
  const response = NextResponse.redirect(buildSettingsRedirect(reason));

  response.cookies.set({
    name: STRAVA_STATE_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: getServerConfig().nodeEnv === "production",
    path: "/api/strava",
    maxAge: 0,
  });

  return response;
}

/** Completes the Strava OAuth callback with strict state checks and encrypted token persistence. */
export async function GET(request: NextRequest) {
  const config = getServerConfig();
  const searchParams = request.nextUrl.searchParams;
  const deniedReason = searchParams.get("error");

  if (!config.strava.isReady) {
    return redirectToSettings("not-ready");
  }

  if (deniedReason === "access_denied") {
    return redirectToSettings("access-denied");
  }

  const stateValidation = validateStravaOAuthState({
    cookieState: request.cookies.get(STRAVA_STATE_COOKIE_NAME)?.value,
    returnedState: searchParams.get("state"),
    expectedOwnerId: LOCAL_DEFAULT_OWNER_ID,
  });

  if (!stateValidation.ok) {
    return redirectToSettings(`invalid-state-${stateValidation.reason}`);
  }

  const code = searchParams.get("code");
  const acceptedScope = searchParams.get("scope");

  if (!code) {
    return redirectToSettings("missing-code");
  }

  if (!hasRequiredStravaScopes(acceptedScope)) {
    return redirectToSettings("missing-scope");
  }

  try {
    const tokenResponse = await exchangeStravaAuthorizationCode(code);
    const persistenceResult = await persistStravaConnection({
      ownerId: stateValidation.ownerId,
      acceptedScope: acceptedScope ?? "",
      tokenResponse,
    });

    if (!persistenceResult.ok) {
      return redirectToSettings(persistenceResult.reason);
    }

    return redirectToSettings("connected");
  } catch {
    return redirectToSettings("exchange-failed");
  }
}
