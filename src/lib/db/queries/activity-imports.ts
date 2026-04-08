import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { activityImports } from "@/lib/db/schema";

/** Finds a prior import by checksum so manual uploads can be deduped before parsing. */
export async function findImportByChecksum(
  ownerId: string,
  checksumSha256: string,
) {
  const [activityImport] = await db
    .select()
    .from(activityImports)
    .where(
      and(
        eq(activityImports.ownerId, ownerId),
        eq(activityImports.checksumSha256, checksumSha256),
      ),
    )
    .limit(1);

  return activityImport ?? null;
}

/** Lists recent imports for the current owner so ingestion status can be surfaced later. */
export async function listRecentImports(ownerId: string, limit = 10) {
  return db
    .select()
    .from(activityImports)
    .where(eq(activityImports.ownerId, ownerId))
    .orderBy(desc(activityImports.createdAt))
    .limit(limit);
}
