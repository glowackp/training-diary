import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { activities } from "@/lib/db/schema";
import {
  mapActivityRecord,
  mapActivitySummary,
  type Activity,
  type ActivitySource,
  type ActivitySummary,
} from "@/types/activity";
import type { OwnedEntityReference, OwnerId } from "@/types/owner";
import { normalizeLimit, scopeToOwnedRecord, scopeToOwner } from "./shared";

export type ListRecentActivitiesInput = {
  ownerId: OwnerId;
  limit?: number;
};

export type FindOwnedActivityBySourceInput = {
  ownerId: OwnerId;
  source: ActivitySource;
  sourceActivityId: string;
};

/** Returns recent activities for a single owner while keeping raw table records inside the repository layer. */
export async function listRecentActivities({
  ownerId,
  limit = 5,
}: ListRecentActivitiesInput): Promise<ActivitySummary[]> {
  const records = await db
    .select()
    .from(activities)
    .where(scopeToOwner(activities, ownerId))
    .orderBy(desc(activities.startedAt))
    .limit(normalizeLimit(limit, 5));

  return records.map(mapActivitySummary);
}

/** Resolves a single owner-scoped activity reference so later child writes can inherit the trusted owner id. */
export async function getOwnedActivityById(
  reference: OwnedEntityReference,
): Promise<Activity | null> {
  const [activity] = await db
    .select()
    .from(activities)
    .where(scopeToOwnedRecord(activities, reference))
    .limit(1);

  return activity ? mapActivityRecord(activity) : null;
}

/** Looks up an activity by its source-specific identifier to support ingestion dedupe. */
export async function findActivityBySource({
  ownerId,
  source,
  sourceActivityId,
}: FindOwnedActivityBySourceInput): Promise<Activity | null> {
  const [activity] = await db
    .select()
    .from(activities)
    .where(
      scopeToOwner(
        activities,
        ownerId,
        eq(activities.source, source),
        eq(activities.sourceActivityId, sourceActivityId),
      ),
    )
    .limit(1);

  return activity ? mapActivityRecord(activity) : null;
}
