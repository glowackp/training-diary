import { z } from "zod";
import { placeholderResponse } from "@/lib/utils/api";

type StravaSyncRouteContext = {
  params: Promise<{
    sourceActivityId: string;
  }>;
};

const sourceActivitySchema = z.object({
  sourceActivityId: z.string().min(1),
});

/** Reserves targeted activity re-syncs keyed by a source activity identifier. */
export async function POST(
  _request: Request,
  context: StravaSyncRouteContext,
) {
  const { sourceActivityId } = sourceActivitySchema.parse(await context.params);

  return placeholderResponse({
    message: "Single-activity Strava sync placeholder.",
    status: 202,
    data: {
      sourceActivityId,
    },
  });
}
