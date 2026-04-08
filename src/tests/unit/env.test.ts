import { afterEach, describe, expect, it } from "vitest";
import { getServerConfig, parseServerEnv, resetServerConfigForTests } from "@/lib/config/env";

const originalEnv = { ...process.env };

describe("server config", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    resetServerConfigForTests();
  });

  it("provides safe local defaults for development", () => {
    const env = parseServerEnv({});

    expect(env).toMatchObject({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/training_diary",
      APP_BASE_URL: "http://localhost:3000",
      STORAGE_DRIVER: "local",
      LOCAL_UPLOAD_DIR: ".local/uploads",
    });
  });

  it("rejects half-configured Strava OAuth credentials", () => {
    expect(() =>
      parseServerEnv({
        STRAVA_CLIENT_ID: "client-id-only",
      }),
    ).toThrow(/must be set together/);
  });

  it("builds normalized runtime config from validated env", () => {
    process.env = {
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/training_diary_test",
      APP_BASE_URL: "http://localhost:3001",
      STORAGE_DRIVER: "local",
      LOCAL_UPLOAD_DIR: ".tmp/uploads",
      STRAVA_CLIENT_ID: "client-id",
      STRAVA_CLIENT_SECRET: "client-secret",
    };

    resetServerConfigForTests();

    expect(getServerConfig()).toMatchObject({
      nodeEnv: "test",
      app: {
        baseUrl: "http://localhost:3001",
      },
      database: {
        host: "db:5432",
      },
      storage: {
        driver: "local",
        localUploadDirectory: ".tmp/uploads",
      },
      strava: {
        isConfigured: true,
      },
    });
  });
});
