import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { stravaConnections } from "@/lib/db/schema";
import type { OwnerId } from "@/types/owner";
import { type ReadExecutor, scopeToOwner } from "./shared";

export type StravaConnectionRecord = typeof stravaConnections.$inferSelect;

/** Looks up the current Strava connection for a diary owner. */
export async function getStravaConnectionByOwnerId(
  ownerId: OwnerId,
  executor: ReadExecutor = db,
): Promise<StravaConnectionRecord | null> {
  return getActiveStravaConnectionByOwnerId(ownerId, executor);
}

/** Returns only the active owner-bound Strava connection so webhook and sync flows cannot cross owners. */
export async function getActiveStravaConnectionByOwnerId(
  ownerId: OwnerId,
  executor: ReadExecutor = db,
): Promise<StravaConnectionRecord | null> {
  const [stravaConnection] = await executor
    .select()
    .from(stravaConnections)
    .where(scopeToOwner(stravaConnections, ownerId, eq(stravaConnections.isActive, true)))
    .limit(1);

  return stravaConnection ?? null;
}

/** Resolves the current Strava connection by athlete id so a single athlete cannot be bound to multiple owners. */
export async function getStravaConnectionByAthleteId(
  athleteId: number,
  executor: ReadExecutor = db,
): Promise<StravaConnectionRecord | null> {
  const [stravaConnection] = await executor
    .select()
    .from(stravaConnections)
    .where(eq(stravaConnections.stravaAthleteId, athleteId))
    .limit(1);

  return stravaConnection ?? null;
}
