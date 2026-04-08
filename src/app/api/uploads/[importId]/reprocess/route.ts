import { z } from "zod";
import { placeholderResponse } from "@/lib/utils/api";

type ReprocessRouteContext = {
  params: Promise<{
    importId: string;
  }>;
};

const importIdSchema = z.object({
  importId: z.string().min(1),
});

/** Reserves import reprocessing for parser retries and future deduplication fixes. */
export async function POST(_request: Request, context: ReprocessRouteContext) {
  const { importId } = importIdSchema.parse(await context.params);

  return placeholderResponse({
    message: "Upload reprocess placeholder.",
    status: 202,
    data: {
      importId,
    },
  });
}
