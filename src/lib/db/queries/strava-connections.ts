import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { stravaConnections } from "@/lib/db/schema";

/** Looks up the current Strava connection for a diary owner. */
export async function getStravaConnectionByOwnerId(ownerId: string) {
  const [stravaConnection] = await db
    .select()
    .from(stravaConnections)
    .where(eq(stravaConnections.ownerId, ownerId))
    .limit(1);

  return stravaConnection ?? null;
}
