import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";
import { getServerConfig } from "@/lib/config/env";
import { STRAVA_TOKEN_ENCRYPTION_KEY_VERSION } from "@/lib/strava/constants";

function deriveStravaKey(purpose: string) {
  const config = getServerConfig();

  if (!config.strava.encryptionKey) {
    throw new Error("Strava encryption is not configured.");
  }

  return createHash("sha256")
    .update(`${purpose}:${config.strava.encryptionKey}`)
    .digest();
}

function toBase64Url(value: Buffer) {
  return value.toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url");
}

/** Encrypts a Strava token so raw credential material never touches the database. */
export function encryptStravaSecret(plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveStravaKey("token"), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    encryptedValue: [
      "v1",
      toBase64Url(iv),
      toBase64Url(tag),
      toBase64Url(ciphertext),
    ].join("."),
    keyVersion: STRAVA_TOKEN_ENCRYPTION_KEY_VERSION,
  } as const;
}

/** Decrypts a stored Strava token so refresh logic can reuse the latest encrypted credential later on. */
export function decryptStravaSecret(encryptedValue: string) {
  const [version, iv, tag, ciphertext] = encryptedValue.split(".");

  if (version !== "v1" || !iv || !tag || !ciphertext) {
    throw new Error("Unsupported Strava secret format.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    deriveStravaKey("token"),
    fromBase64Url(iv),
  );

  decipher.setAuthTag(fromBase64Url(tag));

  return Buffer.concat([
    decipher.update(fromBase64Url(ciphertext)),
    decipher.final(),
  ]).toString("utf8");
}

/** Signs opaque OAuth state tokens so callbacks can reject forged or tampered state values. */
export function signStravaState(value: string) {
  return createHmac("sha256", deriveStravaKey("state"))
    .update(value)
    .digest("base64url");
}
