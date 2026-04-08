import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { activities } from "@/lib/db/schema";
import type { activitySourceEnum } from "@/lib/db/schema";

/** Returns the newest stored activities once ingestion flows are implemented. */
export async function listRecentActivities(limit = 5) {
  return db.select().from(activities).orderBy(desc(activities.startedAt)).limit(limit);
}

/** Looks up an activity by its source-specific identifier to support ingestion dedupe. */
export async function findActivityBySource(
  ownerId: string,
  source: (typeof activitySourceEnum.enumValues)[number],
  sourceActivityId: string,
) {
  const [activity] = await db
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.ownerId, ownerId),
        eq(activities.source, source),
        eq(activities.sourceActivityId, sourceActivityId),
      ),
    )
    .limit(1);

  return activity ?? null;
}
