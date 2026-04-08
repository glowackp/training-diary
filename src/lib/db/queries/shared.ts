import { and, eq, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { db } from "@/lib/db/client";
import type { OwnedEntityReference, OwnerId } from "@/types/owner";

type OwnerScopedTable = {
  ownerId: PgColumn;
};

type OwnedEntityTable = OwnerScopedTable & {
  id: PgColumn;
};

export type ReadExecutor = Pick<typeof db, "select">;

/** Caps query limits so future route handlers do not accidentally request unbounded result sets. */
export function normalizeLimit(
  limit: number | undefined,
  fallback: number,
  max = 100,
) {
  if (limit === undefined || !Number.isFinite(limit)) {
    return fallback;
  }

  return Math.min(max, Math.max(1, Math.trunc(limit)));
}

/** Applies the mandatory owner boundary used by all owner-scoped repository calls. */
export function scopeToOwner<TTable extends OwnerScopedTable>(
  table: TTable,
  ownerId: OwnerId,
  ...conditions: SQL[]
) {
  const ownerCondition = eq(table.ownerId, ownerId);

  return conditions.length === 0
    ? ownerCondition
    : and(ownerCondition, ...conditions);
}

/** Applies both the entity id and owner id so callers cannot accidentally update a foreign row. */
export function scopeToOwnedRecord<TTable extends OwnedEntityTable>(
  table: TTable,
  reference: OwnedEntityReference,
  ...conditions: SQL[]
) {
  const idCondition = eq(table.id, reference.id);

  return scopeToOwner(table, reference.ownerId, idCondition, ...conditions);
}

/** Central transaction entry point for multi-step ingest flows that must commit atomically later on. */
export async function withDatabaseTransaction<T>(
  callback: Parameters<typeof db.transaction>[0],
) {
  return db.transaction(callback) as Promise<T>;
}
