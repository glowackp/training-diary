import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createOwnershipColumns, createTimestampColumns } from "@/lib/db/schema/shared";

/** Stores the server-side Strava connection state and encrypted token material. */
export const stravaConnections = pgTable(
  "strava_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ...createOwnershipColumns(),
    stravaAthleteId: bigint("strava_athlete_id", { mode: "number" }).notNull(),
    athleteUsername: varchar("athlete_username", { length: 255 }),
    athleteDisplayName: varchar("athlete_display_name", { length: 255 }),
    scopes: jsonb("scopes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    encryptedAccessToken: varchar("encrypted_access_token", { length: 2048 }).notNull(),
    encryptedRefreshToken: varchar("encrypted_refresh_token", { length: 2048 }).notNull(),
    // Track which server-side key version encrypted the stored tokens so rotation can be staged safely.
    tokenEncryptionKeyVersion: integer("token_encryption_key_version")
      .notNull()
      .default(1),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }).notNull(),
    lastSuccessfulSyncAt: timestamp("last_successful_sync_at", {
      withTimezone: true,
    }),
    lastWebhookEventAt: timestamp("last_webhook_event_at", {
      withTimezone: true,
    }),
    isActive: boolean("is_active").notNull().default(true),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...createTimestampColumns(),
  },
  (table) => ({
    ownerUniqueIndex: uniqueIndex("strava_connections_owner_id_unique").on(
      table.ownerId,
    ),
    athleteUniqueIndex: uniqueIndex(
      "strava_connections_strava_athlete_id_unique",
    ).on(table.stravaAthleteId),
    ownerActiveIndex: index("strava_connections_owner_active_idx").on(
      table.ownerId,
      table.isActive,
    ),
    tokenExpiryIndex: index("strava_connections_token_expiry_idx").on(
      table.accessTokenExpiresAt,
    ),
  }),
);
