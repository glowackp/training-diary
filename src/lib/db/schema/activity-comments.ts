import { index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { activities } from "@/lib/db/schema/activities";
import { createOwnershipColumns, createTimestampColumns } from "@/lib/db/schema/shared";

/** Stores the diary owner's personal note for an activity as a dedicated record. */
export const activityComments = pgTable(
  "activity_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ...createOwnershipColumns(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    ...createTimestampColumns(),
  },
  (table) => ({
    activityUniqueIndex: uniqueIndex("activity_comments_activity_id_unique").on(
      table.activityId,
    ),
    ownerIndex: index("activity_comments_owner_id_idx").on(table.ownerId),
    activityIndex: index("activity_comments_activity_idx").on(table.activityId),
  }),
);
