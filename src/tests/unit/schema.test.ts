import { describe, expect, it } from "vitest";
import {
  activities,
  activityComments,
  activityImports,
  activityStreams,
  dailyActivityStats,
  stravaConnections,
  stravaWebhookEvents,
} from "@/lib/db/schema";

describe("database schema exports", () => {
  it("exposes the Phase 1 tables", () => {
    expect(activities).toBeTruthy();
    expect(stravaConnections).toBeTruthy();
    expect(activityImports).toBeTruthy();
    expect(activityStreams).toBeTruthy();
    expect(stravaWebhookEvents).toBeTruthy();
    expect(activityComments).toBeTruthy();
    expect(dailyActivityStats).toBeTruthy();
  });
});
