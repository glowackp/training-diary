import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { stravaConnections } from "@/lib/db/schema";
import type { OwnerId } from "@/types/owner";
import { scopeToOwner } from "./shared";

export type StravaConnectionRecord = typeof stravaConnections.$inferSelect;

/** Looks up the current Strava connection for a diary owner. */
export async function getStravaConnectionByOwnerId(
  ownerId: OwnerId,
): Promise<StravaConnectionRecord | null> {
  return getActiveStravaConnectionByOwnerId(ownerId);
}

/** Returns only the active owner-bound Strava connection so webhook and sync flows cannot cross owners. */
export async function getActiveStravaConnectionByOwnerId(
  ownerId: OwnerId,
): Promise<StravaConnectionRecord | null> {
  const [stravaConnection] = await db
    .select()
    .from(stravaConnections)
    .where(scopeToOwner(stravaConnections, ownerId, eq(stravaConnections.isActive, true)))
    .limit(1);

  return stravaConnection ?? null;
}
