import { z } from "zod";
import { getServerConfig } from "@/lib/config/env";
import {
  STRAVA_AUTHORIZE_URL,
  STRAVA_REQUIRED_SCOPES,
  STRAVA_TOKEN_URL,
} from "@/lib/strava/constants";
import {
  createStravaApiRequestError,
} from "@/lib/strava/http";
import type {
  StravaTokenExchangeResponse,
  StravaTokenRefreshResponse,
} from "@/lib/strava/types";

const stravaAthleteSummarySchema = z.object({
  id: z.number().int().positive(),
  username: z.string().nullable().optional(),
  firstname: z.string().nullable().optional(),
  lastname: z.string().nullable().optional(),
});

const stravaTokenResponseBaseSchema = z.object({
  token_type: z.literal("Bearer"),
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_at: z.number().int().positive(),
  expires_in: z.number().int().positive(),
});

const stravaTokenExchangeResponseSchema = stravaTokenResponseBaseSchema.extend({
  athlete: stravaAthleteSummarySchema,
});

const stravaTokenRefreshResponseSchema = stravaTokenResponseBaseSchema;

function buildStravaCallbackUrl() {
  return new URL("/api/strava/callback", getServerConfig().app.baseUrl).toString();
}

function doesAcceptedScopeSatisfyRequirement(
  acceptedScopes: Set<string>,
  requiredScope: string,
) {
  if (acceptedScopes.has(requiredScope)) {
    return true;
  }

  // Strava's broader private-activity scope also covers the base activity read capability.
  return requiredScope === "activity:read" && acceptedScopes.has("activity:read_all");
}

async function postStravaTokenRequest(body: URLSearchParams) {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw await createStravaApiRequestError(
      response,
      "Strava token request failed",
    );
  }

  return response.json();
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

/** Normalizes accepted scope data from Strava so downstream checks can reuse the same scope semantics. */
export function normalizeStravaScopes(
  scope: string | string[] | null | undefined,
) {
  const rawScopes = Array.isArray(scope) ? scope : scope?.split(",") ?? [];

  return [...new Set(rawScopes.map((value) => value.trim()).filter(Boolean))].sort();
}

/** Validates the accepted scopes returned by Strava so auth and later reads fail closed on missing capability. */
export function hasRequiredStravaScopes(
  scope: string | string[] | null | undefined,
) {
  const acceptedScopes = new Set(normalizeStravaScopes(scope));

  return STRAVA_REQUIRED_SCOPES.every((requiredScope) =>
    doesAcceptedScopeSatisfyRequirement(acceptedScopes, requiredScope),
  );
}

/** Exchanges the one-time authorization code on the server so the browser never sees Strava tokens. */
export async function exchangeStravaAuthorizationCode(
  code: string,
): Promise<StravaTokenExchangeResponse> {
  const config = getServerConfig();
  const payload = await postStravaTokenRequest(
    new URLSearchParams({
      client_id: config.strava.clientId ?? "",
      client_secret: config.strava.clientSecret ?? "",
      code,
      grant_type: "authorization_code",
    }),
  );

  return stravaTokenExchangeResponseSchema.parse(payload);
}

/** Refreshes a short-lived Strava access token entirely on the server using the stored refresh token. */
export async function refreshStravaAccessToken(
  refreshToken: string,
): Promise<StravaTokenRefreshResponse> {
  const config = getServerConfig();
  const payload = await postStravaTokenRequest(
    new URLSearchParams({
      client_id: config.strava.clientId ?? "",
      client_secret: config.strava.clientSecret ?? "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  );

  return stravaTokenRefreshResponseSchema.parse(payload);
}
