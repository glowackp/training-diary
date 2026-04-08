import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getActiveStravaConnectionByAthleteId,
  type StravaConnectionRecord,
} from "@/lib/db/queries/strava-connections";
import { withDatabaseTransaction } from "@/lib/db/queries/shared";
import { stravaWebhookEvents } from "@/lib/db/schema";
import type { OwnerId } from "@/types/owner";

const stravaWebhookVerificationQuerySchema = z.object({
  "hub.mode": z.literal("subscribe"),
  "hub.verify_token": z.string().trim().min(1),
  "hub.challenge": z.string().trim().min(1),
});

const stravaWebhookEventPayloadSchema = z.object({
  aspect_type: z.string().trim().min(1),
  event_time: z.number().int().positive(),
  object_id: z.number().int().positive(),
  object_type: z.string().trim().min(1),
  owner_id: z.number().int().positive().optional(),
  subscription_id: z.number().int().positive(),
  updates: z.record(z.string(), z.unknown()).optional().nullable(),
});

type StravaWebhookProcessingState =
  | {
      processingStatus: "pending";
      ownerId: OwnerId;
      stravaConnectionId: string;
      failureReason: null;
      processedAt: null;
    }
  | {
      processingStatus: "ignored";
      ownerId: OwnerId | null;
      stravaConnectionId: string | null;
      failureReason:
        | "missing_owner_id"
        | "owner_not_connected"
        | "unsupported_event"
        | "unsupported_athlete_event";
      processedAt: Date;
    };

export type StravaWebhookEventPayload = z.infer<
  typeof stravaWebhookEventPayloadSchema
>;

export type IngestStravaWebhookEventResult =
  | { ok: true; state: "stored_pending" | "stored_ignored" | "duplicate" }
  | { ok: false; state: "invalid_payload" };

type StravaWebhookVerificationResult =
  | { ok: true; challenge: string }
  | {
      ok: false;
      reason: "not_configured" | "invalid_request" | "invalid_token";
    };

function isAthleteDeauthorizationEvent(payload: StravaWebhookEventPayload) {
  if (payload.object_type !== "athlete" || payload.aspect_type !== "update") {
    return false;
  }

  const authorized = payload.updates?.authorized;

  return authorized === false || authorized === "false";
}

function isSupportedActivityEvent(payload: StravaWebhookEventPayload) {
  return (
    payload.object_type === "activity" &&
    ["create", "update", "delete"].includes(payload.aspect_type)
  );
}

/** Validates the Strava subscription verification query without exposing the shared secret in any response path. */
export function verifyStravaWebhookSubscription(params: {
  expectedVerifyToken: string | null;
  searchParams: URLSearchParams;
}): StravaWebhookVerificationResult {
  if (!params.expectedVerifyToken) {
    return { ok: false, reason: "not_configured" as const };
  }

  const parsedQuery = stravaWebhookVerificationQuerySchema.safeParse(
    Object.fromEntries(params.searchParams.entries()),
  );

  if (!parsedQuery.success) {
    return { ok: false, reason: "invalid_request" as const };
  }

  if (parsedQuery.data["hub.verify_token"] !== params.expectedVerifyToken) {
    return { ok: false, reason: "invalid_token" as const };
  }

  return {
    ok: true,
    challenge: parsedQuery.data["hub.challenge"],
  } as const;
}

/** Parses only the supported Strava webhook envelope so unsupported payloads can be acknowledged safely without crashing the route. */
export function parseStravaWebhookEventPayload(payload: unknown) {
  return stravaWebhookEventPayloadSchema.safeParse(payload);
}

/** Maps a Strava webhook payload to the owner-scoped processing state that future incremental workers will consume. */
export function resolveStravaWebhookProcessingState(params: {
  connection: Pick<StravaConnectionRecord, "id" | "ownerId"> | null;
  payload: StravaWebhookEventPayload;
  now?: Date;
}): StravaWebhookProcessingState {
  const now = params.now ?? new Date();

  if (!params.payload.owner_id) {
    return {
      processingStatus: "ignored",
      ownerId: null,
      stravaConnectionId: null,
      failureReason: "missing_owner_id",
      processedAt: now,
    };
  }

  if (!params.connection) {
    return {
      processingStatus: "ignored",
      ownerId: null,
      stravaConnectionId: null,
      failureReason: "owner_not_connected",
      processedAt: now,
    };
  }

  if (
    isSupportedActivityEvent(params.payload) ||
    isAthleteDeauthorizationEvent(params.payload)
  ) {
    return {
      processingStatus: "pending",
      ownerId: params.connection.ownerId,
      stravaConnectionId: params.connection.id,
      failureReason: null,
      processedAt: null,
    };
  }

  if (params.payload.object_type !== "athlete") {
    return {
      processingStatus: "ignored",
      ownerId: params.connection.ownerId,
      stravaConnectionId: params.connection.id,
      failureReason: "unsupported_event",
      processedAt: now,
    };
  }

  return {
    processingStatus: "ignored",
    ownerId: params.connection.ownerId,
    stravaConnectionId: params.connection.id,
    failureReason: "unsupported_athlete_event",
    processedAt: now,
  };
}

/** Persists a Strava webhook delivery as either pending future work or a traceable ignored event. */
export async function ingestStravaWebhookEvent(
  payload: unknown,
): Promise<IngestStravaWebhookEventResult> {
  const parsedPayload = parseStravaWebhookEventPayload(payload);

  if (!parsedPayload.success) {
    return {
      ok: false,
      state: "invalid_payload",
    };
  }

  const normalizedPayload = parsedPayload.data;
  const eventTime = new Date(normalizedPayload.event_time * 1000);

  return withDatabaseTransaction(async (tx) => {
    const connection = normalizedPayload.owner_id
      ? await getActiveStravaConnectionByAthleteId(normalizedPayload.owner_id, tx)
      : null;
    const processingState = resolveStravaWebhookProcessingState({
      connection,
      payload: normalizedPayload,
    });
    const [storedEvent] = await tx
      .insert(stravaWebhookEvents)
      .values({
        ownerId: processingState.ownerId,
        stravaConnectionId: processingState.stravaConnectionId,
        subscriptionId: normalizedPayload.subscription_id,
        stravaAthleteId: normalizedPayload.owner_id ?? null,
        objectType: normalizedPayload.object_type,
        objectId: normalizedPayload.object_id,
        aspectType: normalizedPayload.aspect_type,
        eventTime,
        updates: normalizedPayload.updates ?? null,
        payload,
        processingStatus: processingState.processingStatus,
        processedAt: processingState.processedAt,
        failureReason: processingState.failureReason,
      })
      .onConflictDoNothing()
      .returning({ id: stravaWebhookEvents.id });

    if (!storedEvent) {
      return {
        ok: true,
        state: "duplicate",
      } as const;
    }

    return {
      ok: true,
      state:
        processingState.processingStatus === "pending"
          ? "stored_pending"
          : "stored_ignored",
    } as const;
  });
}

/** Returns a silent webhook acknowledgement body so public callers do not learn anything about local owner mappings. */
export function buildStravaWebhookAckResponse() {
  return new NextResponse(null, { status: 200 });
}

/** Returns the exact challenge shape Strava expects when validating a webhook subscription. */
export function buildStravaWebhookChallengeResponse(challenge: string) {
  return NextResponse.json({
    "hub.challenge": challenge,
  });
}
