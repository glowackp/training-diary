import { placeholderResponse } from "@/lib/utils/api";

/** Reserves the manual upload endpoint for FIT, TCX, and GPX imports. */
export async function POST() {
  return placeholderResponse({
    message: "Activity upload placeholder.",
    status: 202,
    data: {
      supportedFormats: ["FIT", "TCX", "GPX"],
    },
  });
}
