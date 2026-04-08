import { NextRequest, NextResponse } from "next/server";
import { getServerConfig } from "@/lib/config/env";
import {
  buildStravaWebhookAckResponse,
  buildStravaWebhookChallengeResponse,
  ingestStravaWebhookEvent,
  verifyStravaWebhookSubscription,
} from "@/lib/strava/webhooks";

/** Verifies the Strava subscription challenge using the shared verify token configured on the server. */
export async function GET(request: NextRequest) {
  const verification = verifyStravaWebhookSubscription({
    expectedVerifyToken: getServerConfig().strava.webhookVerifyToken,
    searchParams: request.nextUrl.searchParams,
  });

  if (!verification.ok) {
    if (verification.reason === "not_configured") {
      return new NextResponse(null, { status: 503 });
    }

    return new NextResponse(null, {
      status: verification.reason === "invalid_token" ? 403 : 400,
    });
  }

  const { challenge } = verification;

  return buildStravaWebhookChallengeResponse(challenge);
}

/** Accepts Strava webhook deliveries, stores supported events for traceability, and acknowledges safely without leaking mapping details. */
export async function POST(request: NextRequest) {
  if (!getServerConfig().strava.webhookVerifyToken) {
    return new NextResponse(null, { status: 503 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return buildStravaWebhookAckResponse();
  }

  await ingestStravaWebhookEvent(payload);

  return buildStravaWebhookAckResponse();
}
