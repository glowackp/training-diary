import type { activitySourceEnum, activities } from "@/lib/db/schema";
import type { OwnerId } from "@/types/owner";

export type ActivitySource = (typeof activitySourceEnum.enumValues)[number];
export type ActivityRecord = typeof activities.$inferSelect;

type Coordinates = {
  latitude: number;
  longitude: number;
};

/** Normalized activity shape for route handlers and UI-facing services. */
export type Activity = {
  id: string;
  ownerId: OwnerId;
  source: ActivitySource;
  sourceActivityId: string | null;
  title: string;
  description: string | null;
  sportType: string;
  timezone: string | null;
  startedAt: string;
  distanceInMeters: number;
  movingTimeInSeconds: number;
  elapsedTimeInSeconds: number;
  totalElevationGainInMeters: number;
  averageHeartRate: number | null;
  averageSpeedInMetersPerSecond: number | null;
  summaryPolyline: string | null;
  startCoordinates: Coordinates | null;
  endCoordinates: Coordinates | null;
  isPrivate: boolean;
  lastSynchronizedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Smaller list shape for activity feed queries and future dashboard APIs. */
export type ActivitySummary = Pick<
  Activity,
  | "id"
  | "source"
  | "title"
  | "sportType"
  | "startedAt"
  | "distanceInMeters"
  | "movingTimeInSeconds"
  | "averageHeartRate"
  | "isPrivate"
>;

function toCoordinates(
  latitude: number | null,
  longitude: number | null,
): Coordinates | null {
  // Only expose coordinates when both halves of the point exist, so partial DB state does not leak outward.
  if (latitude === null || longitude === null) {
    return null;
  }

  return { latitude, longitude };
}

/** Maps a raw Drizzle record into the normalized activity model used by the application layer. */
export function mapActivityRecord(record: ActivityRecord): Activity {
  return {
    id: record.id,
    ownerId: record.ownerId,
    source: record.source,
    sourceActivityId: record.sourceActivityId,
    title: record.title,
    description: record.description,
    sportType: record.sportType,
    timezone: record.timezone,
    startedAt: record.startedAt.toISOString(),
    distanceInMeters: record.distanceInMeters,
    movingTimeInSeconds: record.movingTimeInSeconds,
    elapsedTimeInSeconds: record.elapsedTimeInSeconds,
    totalElevationGainInMeters: record.totalElevationGainInMeters,
    averageHeartRate: record.averageHeartRate,
    averageSpeedInMetersPerSecond: record.averageSpeedInMetersPerSecond,
    summaryPolyline: record.summaryPolyline,
    startCoordinates: toCoordinates(record.startLatitude, record.startLongitude),
    endCoordinates: toCoordinates(record.endLatitude, record.endLongitude),
    isPrivate: record.isPrivate,
    lastSynchronizedAt: record.lastSynchronizedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/** Builds the compact activity list model so feed queries can avoid leaking raw DB records. */
export function mapActivitySummary(record: ActivityRecord): ActivitySummary {
  const activity = mapActivityRecord(record);

  return {
    id: activity.id,
    source: activity.source,
    title: activity.title,
    sportType: activity.sportType,
    startedAt: activity.startedAt,
    distanceInMeters: activity.distanceInMeters,
    movingTimeInSeconds: activity.movingTimeInSeconds,
    averageHeartRate: activity.averageHeartRate,
    isPrivate: activity.isPrivate,
  };
}
