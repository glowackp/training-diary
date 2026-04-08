import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { activityImports } from "@/lib/db/schema";
import type { OwnerId } from "@/types/owner";
import { normalizeLimit, scopeToOwner } from "./shared";

export type ActivityImportRecord = typeof activityImports.$inferSelect;

export type FindImportByChecksumInput = {
  ownerId: OwnerId;
  checksumSha256: string;
};

export type ListRecentImportsInput = {
  ownerId: OwnerId;
  limit?: number;
};

/** Finds a prior import by checksum so manual uploads can be deduped before parsing. */
export async function findImportByChecksum({
  ownerId,
  checksumSha256,
}: FindImportByChecksumInput): Promise<ActivityImportRecord | null> {
  const [activityImport] = await db
    .select()
    .from(activityImports)
    .where(
      scopeToOwner(
        activityImports,
        ownerId,
        eq(activityImports.checksumSha256, checksumSha256),
      ),
    )
    .limit(1);

  return activityImport ?? null;
}

/** Lists recent imports for the current owner so ingestion status can be surfaced later. */
export async function listRecentImports({
  ownerId,
  limit = 10,
}: ListRecentImportsInput): Promise<ActivityImportRecord[]> {
  return db
    .select()
    .from(activityImports)
    .where(scopeToOwner(activityImports, ownerId))
    .orderBy(desc(activityImports.createdAt))
    .limit(normalizeLimit(limit, 10));
}
