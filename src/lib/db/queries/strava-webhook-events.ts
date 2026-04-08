import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { stravaWebhookEvents } from "@/lib/db/schema";

/** Returns the oldest pending webhook events first so processors can work in delivery order. */
export async function listPendingWebhookEvents(limit = 50) {
  return db
    .select()
    .from(stravaWebhookEvents)
    .where(eq(stravaWebhookEvents.processingStatus, "pending"))
    .orderBy(asc(stravaWebhookEvents.eventTime))
    .limit(limit);
}
