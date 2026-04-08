import packageJson from "../../../package.json";

export const APP_INFO = {
  name: "Training Diary",
  description:
    "A local-first personal training diary for activity history, stats, and Strava sync.",
  version: packageJson.version,
} as const;

export const APP_NAME = APP_INFO.name;
export const APP_DESCRIPTION = APP_INFO.description;
export const APP_VERSION = APP_INFO.version;

/** Returns the canonical application metadata used by the UI and API placeholders. */
export function getAppInfo() {
  return APP_INFO;
}
