export type StravaAthleteSummary = {
  id: number;
  username?: string | null;
  firstname?: string | null;
  lastname?: string | null;
};

export type StravaTokenExchangeResponse = {
  token_type: "Bearer";
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  athlete: StravaAthleteSummary;
};
