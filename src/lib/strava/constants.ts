export const STRAVA_AUTHORIZE_URL = "https://www.strava.com/oauth/authorize";
export const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
export const STRAVA_STATE_COOKIE_NAME = "td_strava_oauth_state";
export const STRAVA_STATE_MAX_AGE_SECONDS = 15 * 60;
export const STRAVA_TOKEN_ENCRYPTION_KEY_VERSION = 1;
export const STRAVA_REQUIRED_SCOPES = ["activity:read_all"] as const;

export type StravaRequiredScope = (typeof STRAVA_REQUIRED_SCOPES)[number];
