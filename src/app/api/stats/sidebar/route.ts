import { placeholderResponse } from "@/lib/utils/api";

/** Returns a placeholder summary for the future dashboard sidebar stats. */
export async function GET() {
  return placeholderResponse({
    message: "Sidebar stats placeholder.",
    data: {
      weeklyDistanceInMeters: 0,
      monthlyDistanceInMeters: 0,
      yearlyDistanceInMeters: 0,
    },
  });
}
