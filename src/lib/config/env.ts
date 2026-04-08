import { z } from "zod";

const optionalSecretSchema = z.string().trim().min(1).optional();

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z
      .string()
      .url()
      .default("postgresql://postgres:postgres@localhost:5432/training_diary"),
    APP_BASE_URL: z.string().url().default("http://localhost:3000"),
    STORAGE_DRIVER: z.enum(["local", "azure"]).default("local"),
    LOCAL_UPLOAD_DIR: z.string().trim().min(1).default(".local/uploads"),
    STRAVA_CLIENT_ID: optionalSecretSchema,
    STRAVA_CLIENT_SECRET: optionalSecretSchema,
    STRAVA_WEBHOOK_VERIFY_TOKEN: optionalSecretSchema,
    STRAVA_ENCRYPTION_KEY: optionalSecretSchema,
  })
  .superRefine((env, context) => {
    const hasClientId = Boolean(env.STRAVA_CLIENT_ID);
    const hasClientSecret = Boolean(env.STRAVA_CLIENT_SECRET);

    // Keep the OAuth placeholder config coherent so later phases do not run with half-configured secrets.
    if (hasClientId !== hasClientSecret) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: hasClientId ? ["STRAVA_CLIENT_SECRET"] : ["STRAVA_CLIENT_ID"],
        message: "STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set together.",
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ServerConfig = ReturnType<typeof buildServerConfig>;

let cachedServerEnv: ServerEnv | undefined;
let cachedServerConfig: ServerConfig | undefined;

type RawServerEnv = Record<string, string | undefined>;

function readRawServerEnv(): RawServerEnv {
  return {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    APP_BASE_URL: process.env.APP_BASE_URL,
    STORAGE_DRIVER: process.env.STORAGE_DRIVER,
    LOCAL_UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR,
    STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID,
    STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET,
    STRAVA_WEBHOOK_VERIFY_TOKEN: process.env.STRAVA_WEBHOOK_VERIFY_TOKEN,
    STRAVA_ENCRYPTION_KEY: process.env.STRAVA_ENCRYPTION_KEY,
  };
}

/** Validates raw server-side environment input before the app resolves runtime config. */
export function parseServerEnv(rawEnv: RawServerEnv = readRawServerEnv()): ServerEnv {
  return serverEnvSchema.parse(rawEnv);
}

function buildServerConfig(env: ServerEnv) {
  const databaseUrl = new URL(env.DATABASE_URL);

  return {
    nodeEnv: env.NODE_ENV,
    app: {
      baseUrl: env.APP_BASE_URL,
    },
    database: {
      url: env.DATABASE_URL,
      host: databaseUrl.host,
    },
    storage: {
      driver: env.STORAGE_DRIVER,
      localUploadDirectory: env.LOCAL_UPLOAD_DIR,
    },
    strava: {
      clientId: env.STRAVA_CLIENT_ID ?? null,
      clientSecret: env.STRAVA_CLIENT_SECRET ?? null,
      webhookVerifyToken: env.STRAVA_WEBHOOK_VERIFY_TOKEN ?? null,
      encryptionKey: env.STRAVA_ENCRYPTION_KEY ?? null,
      isConfigured: Boolean(env.STRAVA_CLIENT_ID && env.STRAVA_CLIENT_SECRET),
    },
  } as const;
}

/** Parses server-side configuration with safe local defaults for Phase 0 development. */
export function getServerEnv(): ServerEnv {
  if (!cachedServerEnv) {
    cachedServerEnv = parseServerEnv();
  }

  return cachedServerEnv;
}

/** Exposes normalized runtime config so route and repository code does not parse env ad hoc. */
export function getServerConfig(): ServerConfig {
  if (!cachedServerConfig) {
    cachedServerConfig = buildServerConfig(getServerEnv());
  }

  return cachedServerConfig;
}

/** Resets cached env/config state for isolated unit tests. */
export function resetServerConfigForTests() {
  cachedServerEnv = undefined;
  cachedServerConfig = undefined;
}
