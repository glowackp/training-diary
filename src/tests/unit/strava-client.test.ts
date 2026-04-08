import { afterEach, describe, expect, it, vi } from "vitest";
import { resetServerConfigForTests } from "@/lib/config/env";
import { STRAVA_TOKEN_URL } from "@/lib/strava/constants";
import {
  listRecentStravaActivities,
  shouldRefreshStravaAccessToken,
} from "@/lib/strava/client";
import { refreshStravaAccessToken } from "@/lib/strava/oauth";

const originalEnv = { ...process.env };
const originalFetch = global.fetch;

describe("Strava token refresh and read helpers", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
    resetServerConfigForTests();
    vi.restoreAllMocks();
  });

  it("refreshes Strava access tokens with the refresh_token grant", async () => {
    process.env = {
      ...process.env,
      STRAVA_CLIENT_ID: "12345",
      STRAVA_CLIENT_SECRET: "super-secret",
      STRAVA_ENCRYPTION_KEY: "12345678901234567890123456789012",
    };

    resetServerConfigForTests();

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          token_type: "Bearer",
          access_token: "new-access-token",
          refresh_token: "new-refresh-token",
          expires_at: 1_900_000_000,
          expires_in: 21_600,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    global.fetch = fetchMock as typeof fetch;

    const tokenState = await refreshStravaAccessToken("stored-refresh-token");
    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(tokenState).toMatchObject({
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(STRAVA_TOKEN_URL);
    expect((requestInit.body as URLSearchParams).toString()).toContain(
      "grant_type=refresh_token",
    );
    expect((requestInit.body as URLSearchParams).toString()).toContain(
      "refresh_token=stored-refresh-token",
    );
  });

  it("refreshes access tokens slightly early to avoid mid-request expiry", () => {
    expect(
      shouldRefreshStravaAccessToken(
        new Date("2026-04-08T10:30:00.000Z"),
        new Date("2026-04-08T10:00:00.000Z"),
      ),
    ).toBe(true);
    expect(
      shouldRefreshStravaAccessToken(
        new Date("2026-04-08T12:30:00.000Z"),
        new Date("2026-04-08T10:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("lists recent athlete activities with the stored bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 123,
            name: "Morning Run",
            sport_type: "Run",
            start_date: "2026-04-07T06:30:00Z",
            distance: 5000,
            moving_time: 1500,
            elapsed_time: 1560,
            total_elevation_gain: 42,
            visibility: "everyone",
          },
        ]),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    global.fetch = fetchMock as typeof fetch;

    const activities = await listRecentStravaActivities("access-token");
    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [
      URL,
      RequestInit,
    ];

    expect(requestUrl.toString()).toContain("/api/v3/athlete/activities");
    expect(requestUrl.searchParams.get("per_page")).toBe("3");
    expect(requestInit.headers).toMatchObject({
      Authorization: "Bearer access-token",
    });
    expect(activities).toEqual([
      expect.objectContaining({
        id: 123,
        name: "Morning Run",
      }),
    ]);
  });
});
