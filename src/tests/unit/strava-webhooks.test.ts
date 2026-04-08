import { describe, expect, it } from "vitest";
import {
  parseStravaWebhookEventPayload,
  resolveStravaWebhookProcessingState,
  verifyStravaWebhookSubscription,
} from "@/lib/strava/webhooks";

describe("Strava webhook helpers", () => {
  it("verifies the Strava webhook challenge with the configured verify token", () => {
    const result = verifyStravaWebhookSubscription({
      expectedVerifyToken: "verify-me",
      searchParams: new URLSearchParams({
        "hub.mode": "subscribe",
        "hub.verify_token": "verify-me",
        "hub.challenge": "challenge-value",
      }),
    });

    expect(result).toEqual({
      ok: true,
      challenge: "challenge-value",
    });
  });

  it("rejects webhook verification when the verify token does not match", () => {
    const result = verifyStravaWebhookSubscription({
      expectedVerifyToken: "verify-me",
      searchParams: new URLSearchParams({
        "hub.mode": "subscribe",
        "hub.verify_token": "wrong-token",
        "hub.challenge": "challenge-value",
      }),
    });

    expect(result).toEqual({
      ok: false,
      reason: "invalid_token",
    });
  });

  it("parses a supported webhook payload with optional updates", () => {
    const parsedPayload = parseStravaWebhookEventPayload({
      aspect_type: "update",
      event_time: 1_900_000_000,
      object_id: 123,
      object_type: "activity",
      owner_id: 456,
      subscription_id: 789,
      updates: {
        title: "Evening Run",
        private: true,
      },
    });

    expect(parsedPayload.success).toBe(true);
  });

  it("marks mapped activity events as pending future work", () => {
    const parsedPayload = parseStravaWebhookEventPayload({
      aspect_type: "create",
      event_time: 1_900_000_000,
      object_id: 123,
      object_type: "activity",
      owner_id: 456,
      subscription_id: 789,
    });

    if (!parsedPayload.success) {
      throw new Error("Expected payload to parse for test.");
    }

    const result = resolveStravaWebhookProcessingState({
      connection: {
        id: "connection-id",
        ownerId: "local-default",
      },
      payload: parsedPayload.data,
      now: new Date("2026-04-08T12:00:00.000Z"),
    });

    expect(result).toEqual({
      processingStatus: "pending",
      ownerId: "local-default",
      stravaConnectionId: "connection-id",
      failureReason: null,
      processedAt: null,
    });
  });

  it("marks athlete deauthorization events as pending future work", () => {
    const parsedPayload = parseStravaWebhookEventPayload({
      aspect_type: "update",
      event_time: 1_900_000_000,
      object_id: 456,
      object_type: "athlete",
      owner_id: 456,
      subscription_id: 789,
      updates: {
        authorized: "false",
      },
    });

    if (!parsedPayload.success) {
      throw new Error("Expected payload to parse for test.");
    }

    const result = resolveStravaWebhookProcessingState({
      connection: {
        id: "connection-id",
        ownerId: "local-default",
      },
      payload: parsedPayload.data,
      now: new Date("2026-04-08T12:00:00.000Z"),
    });

    expect(result.processingStatus).toBe("pending");
  });

  it("ignores parseable webhook payloads that cannot be mapped to an owner", () => {
    const parsedPayload = parseStravaWebhookEventPayload({
      aspect_type: "update",
      event_time: 1_900_000_000,
      object_id: 123,
      object_type: "activity",
      subscription_id: 789,
    });

    if (!parsedPayload.success) {
      throw new Error("Expected payload to parse for test.");
    }

    const now = new Date("2026-04-08T12:00:00.000Z");
    const result = resolveStravaWebhookProcessingState({
      connection: null,
      payload: parsedPayload.data,
      now,
    });

    expect(result).toEqual({
      processingStatus: "ignored",
      ownerId: null,
      stravaConnectionId: null,
      failureReason: "missing_owner_id",
      processedAt: now,
    });
  });

  it("ignores unsupported athlete events while preserving the mapped owner context", () => {
    const parsedPayload = parseStravaWebhookEventPayload({
      aspect_type: "update",
      event_time: 1_900_000_000,
      object_id: 456,
      object_type: "athlete",
      owner_id: 456,
      subscription_id: 789,
      updates: {
        bio: "updated",
      },
    });

    if (!parsedPayload.success) {
      throw new Error("Expected payload to parse for test.");
    }

    const now = new Date("2026-04-08T12:00:00.000Z");
    const result = resolveStravaWebhookProcessingState({
      connection: {
        id: "connection-id",
        ownerId: "local-default",
      },
      payload: parsedPayload.data,
      now,
    });

    expect(result).toEqual({
      processingStatus: "ignored",
      ownerId: "local-default",
      stravaConnectionId: "connection-id",
      failureReason: "unsupported_athlete_event",
      processedAt: now,
    });
  });
});
