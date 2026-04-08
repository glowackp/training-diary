import { placeholderResponse } from "@/lib/utils/api";

/** Returns a placeholder calendar aggregation response. */
export async function GET() {
  return placeholderResponse({
    message: "Calendar stats placeholder.",
    data: {
      days: [],
    },
  });
}
