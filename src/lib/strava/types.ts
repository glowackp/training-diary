export type StravaAthleteSummary = {
  id: number;
  username?: string | null;
  firstname?: string | null;
  lastname?: string | null;
};

export type StravaTokenResponseBase = {
  token_type: "Bearer";
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
};

export type StravaTokenExchangeResponse = {
  athlete: StravaAthleteSummary;
} & StravaTokenResponseBase;

export type StravaTokenRefreshResponse = StravaTokenResponseBase;

export type StravaSummaryActivity = {
  id: number;
  name: string;
  sport_type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  visibility?: string | null;
};

export type StravaFault = {
  message?: string;
  errors?: Array<{
    resource?: string;
    field?: string;
    code?: string;
  }>;
};
