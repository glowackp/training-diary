import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/** Defines the minimal activity table needed for the initial project skeleton. */
export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: varchar("source", { length: 32 }).notNull().default("manual"),
  sourceActivityId: varchar("source_activity_id", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  sportType: varchar("sport_type", { length: 64 }).notNull().default("run"),
  distanceInMeters: integer("distance_in_meters").notNull().default(0),
  movingTimeInSeconds: integer("moving_time_in_seconds").notNull().default(0),
  averageHeartRate: integer("average_heart_rate"),
  comment: text("comment"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
