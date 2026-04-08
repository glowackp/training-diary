/** Describes the minimum activity shape the app will build on in later phases. */
export type Activity = {
  id: string;
  source: "strava" | "manual";
  title: string;
  sportType: string;
  distanceInMeters: number;
  movingTimeInSeconds: number;
  averageHeartRate?: number | null;
  comment?: string | null;
  startedAt: string;
};
