import { describe, expect, it } from "vitest";
import { LOCAL_DEFAULT_OWNER_ID } from "@/lib/config/local-development";
import { buildLocalSeedPlan } from "@/lib/db/local-seed";

describe("buildLocalSeedPlan", () => {
  it("creates local demo fixtures for the locked seed owner without Strava rows", () => {
    const plan = buildLocalSeedPlan();

    expect(plan.ownerId).toBe(LOCAL_DEFAULT_OWNER_ID);
    expect(plan.activities).toHaveLength(3);
    expect(plan.dailyStats.length).toBeGreaterThan(0);
    expect(plan.activities.every((activity) => activity.source === "manual_upload")).toBe(
      true,
    );
  });
});
