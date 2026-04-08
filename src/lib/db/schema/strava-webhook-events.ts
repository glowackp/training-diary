import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { webhookProcessingStatusEnum } from "@/lib/db/schema/enums";
import { stravaConnections } from "@/lib/db/schema/strava-connections";
import { createTimestampColumns } from "@/lib/db/schema/shared";

/** Persists incoming webhook deliveries so they can be deduped and replayed safely. */
export const stravaWebhookEvents = pgTable(
  "strava_webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: varchar("owner_id", { length: 128 }),
    stravaConnectionId: uuid("strava_connection_id").references(
      () => stravaConnections.id,
      { onDelete: "set null" },
    ),
    subscriptionId: integer("subscription_id").notNull(),
    stravaAthleteId: bigint("strava_athlete_id", { mode: "number" }),
    objectType: varchar("object_type", { length: 32 }).notNull(),
    objectId: bigint("object_id", { mode: "number" }).notNull(),
    aspectType: varchar("aspect_type", { length: 32 }).notNull(),
    eventTime: timestamp("event_time", { withTimezone: true }).notNull(),
    updates: jsonb("updates"),
    payload: jsonb("payload").notNull(),
    processingStatus: webhookProcessingStatusEnum("processing_status")
      .notNull()
      .default("pending"),
    processingAttemptCount: integer("processing_attempt_count").notNull().default(0),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
    ...createTimestampColumns(),
  },
  (table) => ({
    eventFingerprintUniqueIndex: uniqueIndex(
      "strava_webhook_events_fingerprint_unique",
    ).on(
      table.subscriptionId,
      table.objectType,
      table.objectId,
      table.aspectType,
      table.eventTime,
    ),
    processingIndex: index("strava_webhook_events_processing_idx").on(
      table.processingStatus,
      table.eventTime,
    ),
    ownerEventIndex: index("strava_webhook_events_owner_event_idx").on(
      table.ownerId,
      table.eventTime,
    ),
    athleteIndex: index("strava_webhook_events_athlete_idx").on(
      table.stravaAthleteId,
    ),
  }),
);
