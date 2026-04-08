import { z } from "zod";
import { getServerConfig } from "@/lib/config/env";
import {
  STRAVA_AUTHORIZE_URL,
  STRAVA_REQUIRED_SCOPES,
  STRAVA_TOKEN_URL,
} from "@/lib/strava/constants";
import type { StravaTokenExchangeResponse } from "@/lib/strava/types";

const stravaTokenExchangeResponseSchema = z.object({
  token_type: z.literal("Bearer"),
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_at: z.number().int().positive(),
  expires_in: z.number().int().positive(),
  athlete: z.object({
    id: z.number().int().positive(),
    username: z.string().nullable().optional(),
    firstname: z.string().nullable().optional(),
    lastname: z.string().nullable().optional(),
  }),
});

function buildStravaCallbackUrl() {
  return new URL("/api/strava/callback", getServerConfig().app.baseUrl).toString();
}

/** Builds the Strava authorization URL using the locked scope set for the first auth slice. */
export function buildStravaAuthorizeUrl(state: string) {
  const config = getServerConfig();
  const url = new URL(STRAVA_AUTHORIZE_URL);

  url.searchParams.set("client_id", config.strava.clientId ?? "");
  url.searchParams.set("redirect_uri", buildStravaCallbackUrl());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", STRAVA_REQUIRED_SCOPES.join(","));
  url.searchParams.set("state", state);

  return url;
}

/** Validates the accepted scopes returned by Strava so auth does not continue with missing permissions. */
export function hasRequiredStravaScopes(scope: string | null) {
  if (!scope) {
    return false;
  }

  const acceptedScopes = new Set(
    scope
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

  return STRAVA_REQUIRED_SCOPES.every((requiredScope) =>
    acceptedScopes.has(requiredScope),
  );
}

/** Exchanges the one-time authorization code on the server so the browser never sees Strava tokens. */
export async function exchangeStravaAuthorizationCode(
  code: string,
): Promise<StravaTokenExchangeResponse> {
  const config = getServerConfig();
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.strava.clientId ?? "",
      client_secret: config.strava.clientSecret ?? "",
      code,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Strava token exchange failed with status ${response.status}.`);
  }

  return stravaTokenExchangeResponseSchema.parse(await response.json());
}
