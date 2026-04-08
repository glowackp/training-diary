import { z } from "zod";
import { placeholderResponse } from "@/lib/utils/api";

type ActivityRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const activityIdSchema = z.object({
  id: z.string().min(1),
});

/** Returns a placeholder activity payload scoped to a single route identifier. */
export async function GET(_request: Request, context: ActivityRouteContext) {
  const { id } = activityIdSchema.parse(await context.params);

  return placeholderResponse({
    message: "Activity detail placeholder.",
    data: {
      id,
    },
  });
}
