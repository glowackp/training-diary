import { describe, expect, it } from "vitest";
import { APP_NAME, APP_VERSION, getAppInfo } from "@/lib/config/app";

describe("getAppInfo", () => {
  it("returns the canonical app metadata", () => {
    expect(getAppInfo()).toEqual({
      name: APP_NAME,
      description:
        "A local-first personal training diary for activity history, stats, and Strava sync.",
      version: APP_VERSION,
    });
  });
});
