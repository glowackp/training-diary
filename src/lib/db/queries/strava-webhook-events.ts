import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { stravaWebhookEvents } from "@/lib/db/schema";
import { normalizeLimit } from "./shared";

export type StravaWebhookEventRecord = typeof stravaWebhookEvents.$inferSelect;

/** Returns the oldest pending webhook events first so processors can work in delivery order. */
export async function listPendingWebhookEvents(
  limit = 50,
): Promise<StravaWebhookEventRecord[]> {
  return db
    .select()
    .from(stravaWebhookEvents)
    .where(eq(stravaWebhookEvents.processingStatus, "pending"))
    .orderBy(asc(stravaWebhookEvents.eventTime))
    .limit(normalizeLimit(limit, 50, 200));
}
