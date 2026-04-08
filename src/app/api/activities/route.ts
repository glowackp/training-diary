import { placeholderResponse } from "@/lib/utils/api";

/** Returns a placeholder list until activity persistence is wired into the UI. */
export async function GET() {
  return placeholderResponse({
    message: "Activities placeholder.",
    data: {
      items: [],
    },
  });
}
