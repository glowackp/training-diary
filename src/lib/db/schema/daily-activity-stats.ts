import { date, index, integer, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { createOwnershipColumns, createTimestampColumns } from "@/lib/db/schema/shared";

/** Stores pre-aggregated daily stats so calendar and trend views can stay inexpensive. */
export const dailyActivityStats = pgTable(
  "daily_activity_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ...createOwnershipColumns(),
    activityDate: date("activity_date", { mode: "date" }).notNull(),
    timezone: varchar("timezone", { length: 64 }),
    activityCount: integer("activity_count").notNull().default(0),
    distanceInMeters: integer("distance_in_meters").notNull().default(0),
    movingTimeInSeconds: integer("moving_time_in_seconds").notNull().default(0),
    elapsedTimeInSeconds: integer("elapsed_time_in_seconds").notNull().default(0),
    totalElevationGainInMeters: integer("total_elevation_gain_in_meters")
      .notNull()
      .default(0),
    averageHeartRate: integer("average_heart_rate"),
    lastActivityStartedAt: timestamp("last_activity_started_at", {
      withTimezone: true,
    }),
    ...createTimestampColumns(),
  },
  (table) => ({
    ownerDateUniqueIndex: uniqueIndex("daily_activity_stats_owner_date_unique").on(
      table.ownerId,
      table.activityDate,
    ),
    ownerDateIndex: index("daily_activity_stats_owner_date_idx").on(
      table.ownerId,
      table.activityDate,
    ),
  }),
);
