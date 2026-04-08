import { afterEach, describe, expect, it } from "vitest";
import {
  buildStravaAuthorizeUrl,
  hasRequiredStravaScopes,
  normalizeStravaScopes,
} from "@/lib/strava/oauth";
import {
  createStravaOAuthState,
  validateStravaOAuthState,
} from "@/lib/strava/oauth-state";
import {
  decryptStravaSecret,
  encryptStravaSecret,
} from "@/lib/strava/secrets";
import { getServerConfig, parseServerEnv, resetServerConfigForTests } from "@/lib/config/env";

const originalEnv = { ...process.env };

describe("Strava auth helpers", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    resetServerConfigForTests();
  });

  it("rejects Strava auth credentials without an encryption key", () => {
    expect(() =>
      parseServerEnv({
        STRAVA_CLIENT_ID: "12345",
        STRAVA_CLIENT_SECRET: "super-secret",
      }),
    ).toThrow(/STRAVA_ENCRYPTION_KEY/);
  });

  it("marks Strava auth as ready only when the encryption key is configured", () => {
    process.env = {
      ...process.env,
      STRAVA_CLIENT_ID: "12345",
      STRAVA_CLIENT_SECRET: "super-secret",
      STRAVA_ENCRYPTION_KEY: "12345678901234567890123456789012",
    };

    resetServerConfigForTests();

    expect(getServerConfig().strava.isReady).toBe(true);
  });

  it("builds the authorize URL for the server-side code flow", () => {
    process.env = {
      ...process.env,
      APP_BASE_URL: "http://localhost:3000",
      STRAVA_CLIENT_ID: "12345",
      STRAVA_CLIENT_SECRET: "super-secret",
      STRAVA_ENCRYPTION_KEY: "12345678901234567890123456789012",
    };

    resetServerConfigForTests();

    const url = buildStravaAuthorizeUrl("signed-state");

    expect(url.origin).toBe("https://www.strava.com");
    expect(url.searchParams.get("client_id")).toBe("12345");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("activity:read,activity:read_all");
    expect(url.searchParams.get("state")).toBe("signed-state");
  });

  it("validates state tokens against the signed cookie copy", () => {
    process.env = {
      ...process.env,
      STRAVA_ENCRYPTION_KEY: "12345678901234567890123456789012",
    };

    resetServerConfigForTests();

    const state = createStravaOAuthState("local-default");
    const result = validateStravaOAuthState({
      cookieState: state,
      returnedState: state,
      expectedOwnerId: "local-default",
    });

    expect(result).toEqual({
      ok: true,
      ownerId: "local-default",
    });
  });

  it("rejects missing required Strava scopes", () => {
    expect(normalizeStravaScopes("activity:read_all,activity:read_all")).toEqual([
      "activity:read_all",
    ]);
    expect(hasRequiredStravaScopes("read")).toBe(false);
    expect(hasRequiredStravaScopes("activity:read")).toBe(false);
    expect(hasRequiredStravaScopes("activity:read_all")).toBe(true);
    expect(hasRequiredStravaScopes("activity:read,activity:read_all")).toBe(
      true,
    );
  });

  it("encrypts and decrypts Strava tokens without exposing plaintext at rest", () => {
    process.env = {
      ...process.env,
      STRAVA_ENCRYPTION_KEY: "12345678901234567890123456789012",
    };

    resetServerConfigForTests();

    const encrypted = encryptStravaSecret("refresh-token-value");

    expect(encrypted.encryptedValue).not.toContain("refresh-token-value");
    expect(decryptStravaSecret(encrypted.encryptedValue)).toBe(
      "refresh-token-value",
    );
  });
});
