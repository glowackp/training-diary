import { timestamp, varchar } from "drizzle-orm/pg-core";

/** Creates the shared owner column used to keep records partitionable per diary owner. */
export function createOwnershipColumns() {
  return {
    ownerId: varchar("owner_id", { length: 128 }).notNull(),
  };
}

/** Creates the default timestamp columns used across persisted domain records. */
export function createTimestampColumns() {
  return {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  };
}
