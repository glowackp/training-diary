import { db } from "@/lib/db/client";
import {
  getActiveStravaConnectionByOwnerId,
  getStravaConnectionByAthleteId,
} from "@/lib/db/queries/strava-connections";
import { scopeToOwnedRecord, withDatabaseTransaction } from "@/lib/db/queries/shared";
import { stravaConnections } from "@/lib/db/schema";
import { encryptStravaSecret } from "@/lib/strava/secrets";
import type { StravaTokenExchangeResponse } from "@/lib/strava/types";
import type { OwnerId } from "@/types/owner";

export type PersistStravaConnectionResult =
  | { ok: true; action: "created" | "updated" }
  | {
      ok: false;
      reason:
        | "athlete_locked_to_other_owner"
        | "owner_locked_to_other_athlete";
    };

type DatabaseReader = Pick<typeof db, "select">;

function normalizeAthleteDisplayName(
  athlete: StravaTokenExchangeResponse["athlete"],
) {
  const parts = [athlete.firstname, athlete.lastname].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : athlete.username ?? null;
}

/** Persists the active Strava connection while preserving the single-owner and single-athlete locks. */
export async function persistStravaConnection({
  ownerId,
  acceptedScope,
  tokenResponse,
}: {
  ownerId: OwnerId;
  acceptedScope: string;
  tokenResponse: StravaTokenExchangeResponse;
}): Promise<PersistStravaConnectionResult> {
  const acceptedScopes = acceptedScope
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const encryptedAccessToken = encryptStravaSecret(tokenResponse.access_token);
  const encryptedRefreshToken = encryptStravaSecret(tokenResponse.refresh_token);

  return withDatabaseTransaction(async (tx) => {
    const queryExecutor = tx as DatabaseReader;
    const existingOwnerConnection = await getActiveStravaConnectionByOwnerId(
      ownerId,
      queryExecutor,
    );
    const existingAthleteConnection = await getStravaConnectionByAthleteId(
      tokenResponse.athlete.id,
      queryExecutor,
    );

    if (
      existingAthleteConnection &&
      existingAthleteConnection.ownerId !== ownerId
    ) {
      return {
        ok: false,
        reason: "athlete_locked_to_other_owner",
      };
    }

    if (
      existingOwnerConnection &&
      existingOwnerConnection.stravaAthleteId !== tokenResponse.athlete.id
    ) {
      return {
        ok: false,
        reason: "owner_locked_to_other_athlete",
      };
    }

    const connectionToUpdate =
      existingOwnerConnection ??
      (existingAthleteConnection?.ownerId === ownerId
        ? existingAthleteConnection
        : null);

    const connectionValues = {
      ownerId,
      stravaAthleteId: tokenResponse.athlete.id,
      athleteUsername: tokenResponse.athlete.username ?? null,
      athleteDisplayName: normalizeAthleteDisplayName(tokenResponse.athlete),
      scopes: acceptedScopes,
      encryptedAccessToken: encryptedAccessToken.encryptedValue,
      encryptedRefreshToken: encryptedRefreshToken.encryptedValue,
      tokenEncryptionKeyVersion: encryptedRefreshToken.keyVersion,
      accessTokenExpiresAt: new Date(tokenResponse.expires_at * 1000),
      isActive: true,
      revokedAt: null,
      updatedAt: new Date(),
    };

    if (connectionToUpdate) {
      await tx
        .update(stravaConnections)
        .set(connectionValues)
        .where(scopeToOwnedRecord(stravaConnections, connectionToUpdate));

      return {
        ok: true,
        action: "updated",
      };
    }

    await tx.insert(stravaConnections).values({
      ...connectionValues,
      createdAt: new Date(),
    });

    return {
      ok: true,
      action: "created",
    };
  });
}
