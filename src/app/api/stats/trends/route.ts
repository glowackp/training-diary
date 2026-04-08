import { placeholderResponse } from "@/lib/utils/api";

/** Returns a placeholder trend series for future charts and comparisons. */
export async function GET() {
  return placeholderResponse({
    message: "Trend stats placeholder.",
    data: {
      series: [],
    },
  });
}
