import {
  index,
  integer,
  jsonb,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { activities } from "@/lib/db/schema/activities";
import { activityStreamTypeEnum } from "@/lib/db/schema/enums";
import { createOwnershipColumns, createTimestampColumns } from "@/lib/db/schema/shared";

/** Stores detailed stream payloads separately so activity rows stay lightweight. */
export const activityStreams = pgTable(
  "activity_streams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ...createOwnershipColumns(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    streamType: activityStreamTypeEnum("stream_type").notNull(),
    resolution: varchar("resolution", { length: 32 }),
    seriesType: varchar("series_type", { length: 32 }),
    originalSize: integer("original_size"),
    pointCount: integer("point_count").notNull().default(0),
    data: jsonb("data").notNull(),
    ...createTimestampColumns(),
  },
  (table) => ({
    activityStreamUniqueIndex: uniqueIndex(
      "activity_streams_activity_id_stream_type_unique",
    ).on(table.activityId, table.streamType),
    ownerActivityIndex: index("activity_streams_owner_activity_idx").on(
      table.ownerId,
      table.activityId,
    ),
  }),
);
