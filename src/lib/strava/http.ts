import { z } from "zod";
import type { StravaFault } from "@/lib/strava/types";

const stravaFaultSchema = z.object({
  message: z.string().optional(),
  errors: z
    .array(
      z.object({
        resource: z.string().optional(),
        field: z.string().optional(),
        code: z.string().optional(),
      }),
    )
    .optional(),
});

export type StravaRequestFailureReason =
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "upstream_error";

/** Carries the upstream Strava status code so routes can map failures without exposing raw payloads. */
export class StravaApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "StravaApiRequestError";
    this.status = status;
  }
}

function formatFaultMessage(fault: StravaFault | null, fallbackMessage: string) {
  if (!fault?.message) {
    return fallbackMessage;
  }

  return `${fallbackMessage}: ${fault.message}`;
}

/** Normalizes Strava's HTTP status codes into the small set of failure states the app currently understands. */
export function classifyStravaRequestFailure(
  status: number,
): StravaRequestFailureReason {
  if (status === 401) {
    return "unauthorized";
  }

  if (status === 403) {
    return "forbidden";
  }

  if (status === 429) {
    return "rate_limited";
  }

  return "upstream_error";
}

/** Builds a typed upstream error so token refresh and probe reads can react without leaking raw response bodies. */
export async function createStravaApiRequestError(
  response: Response,
  fallbackMessage: string,
) {
  let fault: StravaFault | null = null;

  try {
    const parsedFault = stravaFaultSchema.safeParse(await response.json());

    if (parsedFault.success) {
      fault = parsedFault.data;
    }
  } catch {
    fault = null;
  }

  return new StravaApiRequestError(
    `${formatFaultMessage(fault, fallbackMessage)} (status ${response.status}).`,
    response.status,
  );
}
