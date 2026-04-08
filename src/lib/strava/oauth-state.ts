import { randomBytes, timingSafeEqual } from "node:crypto";
import { STRAVA_STATE_MAX_AGE_SECONDS } from "@/lib/strava/constants";
import { signStravaState } from "@/lib/strava/secrets";
import type { OwnerId } from "@/types/owner";

type StravaOAuthStatePayload = {
  nonce: string;
  ownerId: OwnerId;
  issuedAt: number;
};

export type StravaOAuthStateValidationResult =
  | { ok: true; ownerId: OwnerId }
  | {
      ok: false;
      reason:
        | "missing"
        | "mismatch"
        | "invalid_signature"
        | "expired"
        | "invalid_owner";
    };

function encodeStatePayload(payload: StravaOAuthStatePayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeStatePayload(encodedPayload: string): StravaOAuthStatePayload {
  return JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  ) as StravaOAuthStatePayload;
}

function equalConstantTime(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

/** Creates the opaque state token that is sent to Strava and mirrored into an httpOnly cookie. */
export function createStravaOAuthState(ownerId: OwnerId) {
  const encodedPayload = encodeStatePayload({
    nonce: randomBytes(16).toString("base64url"),
    ownerId,
    issuedAt: Date.now(),
  });
  const signature = signStravaState(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

/** Validates the signed state value and binds it back to the expected owner and browser cookie. */
export function validateStravaOAuthState({
  cookieState,
  returnedState,
  expectedOwnerId,
}: {
  cookieState: string | undefined;
  returnedState: string | null;
  expectedOwnerId: OwnerId;
}): StravaOAuthStateValidationResult {
  if (!cookieState || !returnedState) {
    return { ok: false, reason: "missing" };
  }

  if (!equalConstantTime(cookieState, returnedState)) {
    return { ok: false, reason: "mismatch" };
  }

  const [encodedPayload, signature] = returnedState.split(".");

  if (
    !encodedPayload ||
    !signature ||
    !equalConstantTime(signStravaState(encodedPayload), signature)
  ) {
    return { ok: false, reason: "invalid_signature" };
  }

  const payload = decodeStatePayload(encodedPayload);

  if (payload.ownerId !== expectedOwnerId) {
    return { ok: false, reason: "invalid_owner" };
  }

  if (Date.now() - payload.issuedAt > STRAVA_STATE_MAX_AGE_SECONDS * 1000) {
    return { ok: false, reason: "expired" };
  }

  return {
    ok: true,
    ownerId: payload.ownerId,
  };
}
