import { z } from "zod";
import { getActiveStravaConnectionByOwnerId } from "@/lib/db/queries/strava-connections";
import {
  STRAVA_ACCESS_TOKEN_REFRESH_WINDOW_MS,
  STRAVA_ACTIVITY_PROBE_LIMIT,
  STRAVA_API_BASE_URL,
} from "@/lib/strava/constants";
import {
  classifyStravaRequestFailure,
  createStravaApiRequestError,
  StravaApiRequestError,
} from "@/lib/strava/http";
import { persistRefreshedStravaTokens } from "@/lib/strava/connections";
import {
  hasRequiredStravaScopes,
  refreshStravaAccessToken,
} from "@/lib/strava/oauth";
import { decryptStravaSecret } from "@/lib/strava/secrets";
import type { StravaSummaryActivity } from "@/lib/strava/types";
import type { OwnerId } from "@/types/owner";

const stravaSummaryActivitySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  sport_type: z.string().min(1),
  start_date: z.string().min(1),
  distance: z.number().nonnegative(),
  moving_time: z.number().int().nonnegative(),
  elapsed_time: z.number().int().nonnegative(),
  total_elevation_gain: z.number().nonnegative(),
  visibility: z.string().nullable().optional(),
});

type EnsureStravaAccessTokenResult =
  | { ok: true; accessToken: string; refreshed: boolean }
  | {
      ok: false;
      reason:
        | "not_connected"
        | "insufficient_scopes"
        | "reauthorization_required"
        | "rate_limited"
        | "upstream_error";
    };

export type StravaActivityProbeResult =
  | { ok: true; activities: StravaSummaryActivity[] }
  | {
      ok: false;
      reason:
        | "not_connected"
        | "insufficient_scopes"
        | "reauthorization_required"
        | "rate_limited"
        | "upstream_error";
    };

/** Refreshes slightly early so an in-flight Strava read does not start with a nearly expired token. */
export function shouldRefreshStravaAccessToken(
  accessTokenExpiresAt: Date,
  now = new Date(),
) {
  return (
    accessTokenExpiresAt.getTime() - now.getTime() <=
    STRAVA_ACCESS_TOKEN_REFRESH_WINDOW_MS
  );
}

/** Executes the smallest possible authenticated Strava read used to prove connectivity before sync is built. */
export async function listRecentStravaActivities(
  accessToken: string,
): Promise<StravaSummaryActivity[]> {
  const url = new URL(`${STRAVA_API_BASE_URL}/athlete/activities`);

  url.searchParams.set("page", "1");
  url.searchParams.set("per_page", STRAVA_ACTIVITY_PROBE_LIMIT.toString());

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw await createStravaApiRequestError(
      response,
      "Strava activity probe request failed",
    );
  }

  return z.array(stravaSummaryActivitySchema).parse(await response.json());
}

async function ensureStravaAccessToken(
  ownerId: OwnerId,
  options?: {
    forceRefresh?: boolean;
  },
): Promise<EnsureStravaAccessTokenResult> {
  const connection = await getActiveStravaConnectionByOwnerId(ownerId);

  if (!connection) {
    return {
      ok: false,
      reason: "not_connected",
    };
  }

  if (!hasRequiredStravaScopes(connection.scopes)) {
    return {
      ok: false,
      reason: "insufficient_scopes",
    };
  }

  const shouldRefresh =
    options?.forceRefresh === true ||
    shouldRefreshStravaAccessToken(connection.accessTokenExpiresAt);

  if (!shouldRefresh) {
    return {
      ok: true,
      accessToken: decryptStravaSecret(connection.encryptedAccessToken),
      refreshed: false,
    };
  }

  try {
    const refreshedTokenState = await refreshStravaAccessToken(
      decryptStravaSecret(connection.encryptedRefreshToken),
    );

    await persistRefreshedStravaTokens(connection, refreshedTokenState);

    return {
      ok: true,
      accessToken: refreshedTokenState.access_token,
      refreshed: true,
    };
  } catch (error) {
    if (error instanceof StravaApiRequestError) {
      const failureReason = classifyStravaRequestFailure(error.status);

      if (["unauthorized", "forbidden"].includes(failureReason)) {
        return {
          ok: false,
          reason: "reauthorization_required",
        };
      }

      if (failureReason === "rate_limited") {
        return {
          ok: false,
          reason: "rate_limited",
        };
      }
    }

    return {
      ok: false,
      reason: "upstream_error",
    };
  }
}

/** Proves the stored Strava connection can still perform an authenticated read without starting sync work. */
export async function getStravaActivityProbe(
  ownerId: OwnerId,
): Promise<StravaActivityProbeResult> {
  const accessToken = await ensureStravaAccessToken(ownerId);

  if (!accessToken.ok) {
    return accessToken;
  }

  try {
    const activities = await listRecentStravaActivities(accessToken.accessToken);

    return {
      ok: true,
      activities,
    };
  } catch (error) {
    if (
      error instanceof StravaApiRequestError &&
      classifyStravaRequestFailure(error.status) === "unauthorized" &&
      !accessToken.refreshed
    ) {
      const refreshedAccessToken = await ensureStravaAccessToken(ownerId, {
        forceRefresh: true,
      });

      if (!refreshedAccessToken.ok) {
        return refreshedAccessToken;
      }

      try {
        const activities = await listRecentStravaActivities(
          refreshedAccessToken.accessToken,
        );

        return {
          ok: true,
          activities,
        };
      } catch (retryError) {
        if (
          retryError instanceof StravaApiRequestError &&
          ["unauthorized", "forbidden"].includes(
            classifyStravaRequestFailure(retryError.status),
          )
        ) {
          return {
            ok: false,
            reason: "reauthorization_required",
          };
        }

        if (
          retryError instanceof StravaApiRequestError &&
          classifyStravaRequestFailure(retryError.status) === "rate_limited"
        ) {
          return {
            ok: false,
            reason: "rate_limited",
          };
        }

        return {
          ok: false,
          reason: "upstream_error",
        };
      }
    }

    if (
      error instanceof StravaApiRequestError &&
      classifyStravaRequestFailure(error.status) === "forbidden"
    ) {
      return {
        ok: false,
        reason: "insufficient_scopes",
      };
    }

    if (
      error instanceof StravaApiRequestError &&
      classifyStravaRequestFailure(error.status) === "rate_limited"
    ) {
      return {
        ok: false,
        reason: "rate_limited",
      };
    }

    if (
      error instanceof StravaApiRequestError &&
      classifyStravaRequestFailure(error.status) === "unauthorized"
    ) {
      return {
        ok: false,
        reason: "reauthorization_required",
      };
    }

    return {
      ok: false,
      reason: "upstream_error",
    };
  }
}
