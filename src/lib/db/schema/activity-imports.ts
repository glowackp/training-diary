import {
  check,
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
import {
  activityImportFormatEnum,
  activityImportStatusEnum,
  activitySourceEnum,
} from "@/lib/db/schema/enums";
import { createOwnershipColumns, createTimestampColumns } from "@/lib/db/schema/shared";

/** Tracks ingestion attempts for both Strava syncs and manual file uploads. */
export const activityImports = pgTable(
  "activity_imports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ...createOwnershipColumns(),
    source: activitySourceEnum("source").notNull(),
    format: activityImportFormatEnum("format"),
    status: activityImportStatusEnum("status").notNull().default("pending"),
    originalFileName: varchar("original_file_name", { length: 255 }),
    contentType: varchar("content_type", { length: 255 }),
    storagePath: text("storage_path"),
    checksumSha256: varchar("checksum_sha256", { length: 128 }),
    fileSizeBytes: integer("file_size_bytes"),
    sourceActivityId: varchar("source_activity_id", { length: 255 }),
    failureReason: text("failure_reason"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...createTimestampColumns(),
  },
  (table) => ({
    sourceIntegrityCheck: check(
      "activity_imports_source_integrity_check",
      sql`(
        (${table.source} = 'manual_upload' and ${table.checksumSha256} is not null)
        or
        (${table.source} = 'strava' and ${table.sourceActivityId} is not null)
      )`,
    ),
    checksumUniqueIndex: uniqueIndex("activity_imports_owner_checksum_unique").on(
      table.ownerId,
      table.checksumSha256,
    ),
    sourceActivityUniqueIndex: uniqueIndex(
      "activity_imports_owner_source_activity_id_unique",
    ).on(table.ownerId, table.source, table.sourceActivityId),
    ownerStatusIndex: index("activity_imports_owner_status_idx").on(
      table.ownerId,
      table.status,
    ),
    ownerCreatedIndex: index("activity_imports_owner_created_idx").on(
      table.ownerId,
      table.createdAt,
    ),
  }),
);
