import packageJson from "../../../package.json";

export const APP_NAME = "Training Diary";
export const APP_DESCRIPTION =
  "A local-first personal training diary for activity history, stats, and Strava sync.";
export const APP_VERSION = packageJson.version;

/** Returns the canonical application metadata used by the UI and API placeholders. */
export function getAppInfo() {
  return {
    name: APP_NAME,
    description: APP_DESCRIPTION,
    version: APP_VERSION,
  };
}
