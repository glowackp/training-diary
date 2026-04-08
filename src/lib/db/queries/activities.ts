import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { activities } from "@/lib/db/schema";

/** Returns the newest stored activities once ingestion flows are implemented. */
export async function listRecentActivities(limit = 5) {
  return db.select().from(activities).orderBy(desc(activities.startedAt)).limit(limit);
}
