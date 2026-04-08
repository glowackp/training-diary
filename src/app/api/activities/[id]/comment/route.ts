import { z } from "zod";
import { placeholderResponse } from "@/lib/utils/api";

type ActivityCommentRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const activityCommentSchema = z.object({
  comment: z.string().trim().min(1).max(1000),
});

const activityIdSchema = z.object({
  id: z.string().min(1),
});

/** Validates comment payloads before the persistence layer exists. */
export async function POST(
  request: Request,
  context: ActivityCommentRouteContext,
) {
  const { id } = activityIdSchema.parse(await context.params);
  const body = activityCommentSchema.parse(
    await request.json().catch(() => ({
      comment: "Placeholder comment",
    })),
  );

  return placeholderResponse({
    message: "Activity comment placeholder.",
    status: 202,
    data: {
      id,
      ...body,
    },
  });
}
