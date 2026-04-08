import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { activityImports } from "@/lib/db/schema/activity-imports";
import { activitySourceEnum } from "@/lib/db/schema/enums";
import { stravaConnections } from "@/lib/db/schema/strava-connections";
import { createOwnershipColumns, createTimestampColumns } from "@/lib/db/schema/shared";

/** Stores normalized activities regardless of whether they came from Strava or file upload. */
export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ...createOwnershipColumns(),
    source: activitySourceEnum("source").notNull(),
    sourceActivityId: varchar("source_activity_id", { length: 255 }),
    stravaConnectionId: uuid("strava_connection_id").references(
      () => stravaConnections.id,
      { onDelete: "set null" },
    ),
    importId: uuid("import_id").references(() => activityImports.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    sportType: varchar("sport_type", { length: 64 }).notNull(),
    timezone: varchar("timezone", { length: 64 }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    distanceInMeters: integer("distance_in_meters").notNull().default(0),
    movingTimeInSeconds: integer("moving_time_in_seconds").notNull().default(0),
    elapsedTimeInSeconds: integer("elapsed_time_in_seconds").notNull().default(0),
    totalElevationGainInMeters: integer("total_elevation_gain_in_meters")
      .notNull()
      .default(0),
    averageHeartRate: integer("average_heart_rate"),
    averageSpeedInMetersPerSecond: doublePrecision(
      "average_speed_in_meters_per_second",
    ),
    summaryPolyline: text("summary_polyline"),
    startLatitude: doublePrecision("start_latitude"),
    startLongitude: doublePrecision("start_longitude"),
    endLatitude: doublePrecision("end_latitude"),
    endLongitude: doublePrecision("end_longitude"),
    isPrivate: boolean("is_private").notNull().default(false),
    lastSynchronizedAt: timestamp("last_synchronized_at", {
      withTimezone: true,
    }),
    ...createTimestampColumns(),
  },
  (table) => ({
    sourceIntegrityCheck: check(
      "activities_source_integrity_check",
      sql`(
        (${table.source} = 'strava' and ${table.sourceActivityId} is not null and ${table.stravaConnectionId} is not null)
        or
        (${table.source} = 'manual_upload' and ${table.importId} is not null)
      )`,
    ),
    sourceUniqueIndex: uniqueIndex("activities_owner_source_activity_id_unique").on(
      table.ownerId,
      table.source,
      table.sourceActivityId,
    ),
    importUniqueIndex: uniqueIndex("activities_import_id_unique").on(table.importId),
    ownerStartedIndex: index("activities_owner_started_at_idx").on(
      table.ownerId,
      table.startedAt,
    ),
    ownerSportIndex: index("activities_owner_sport_type_idx").on(
      table.ownerId,
      table.sportType,
    ),
    stravaConnectionIndex: index("activities_strava_connection_id_idx").on(
      table.stravaConnectionId,
    ),
  }),
);
