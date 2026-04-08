import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { getLocalDevelopmentSummary, LOCAL_DEFAULT_OWNER_ID } from "@/lib/config/local-development";
import { db } from "@/lib/db/client";
import {
  activities,
  activityComments,
  activityImports,
  activityStreams,
  dailyActivityStats,
} from "@/lib/db/schema";
import type { OwnerId } from "@/types/owner";

type SeedStreamFixture = {
  streamType: "distance" | "heartrate" | "latlng" | "time";
  resolution: "high";
  seriesType: "distance" | "time";
  data: unknown;
  pointCount: number;
  originalSize: number;
};

type SeedActivityFixture = {
  key: string;
  ownerId: OwnerId;
  source: "manual_upload";
  fileName: string;
  format: "fit" | "tcx" | "gpx";
  contentType: string;
  fileContent: string;
  title: string;
  description: string;
  sportType: string;
  timezone: string;
  startedAt: Date;
  distanceInMeters: number;
  movingTimeInSeconds: number;
  elapsedTimeInSeconds: number;
  totalElevationGainInMeters: number;
  averageHeartRate: number | null;
  averageSpeedInMetersPerSecond: number | null;
  summaryPolyline: string | null;
  startCoordinates: {
    latitude: number;
    longitude: number;
  } | null;
  endCoordinates: {
    latitude: number;
    longitude: number;
  } | null;
  comment: string;
  streams: SeedStreamFixture[];
};

type SeedDailyStats = {
  ownerId: OwnerId;
  activityDate: Date;
  timezone: string;
  activityCount: number;
  distanceInMeters: number;
  movingTimeInSeconds: number;
  elapsedTimeInSeconds: number;
  totalElevationGainInMeters: number;
  averageHeartRate: number | null;
  lastActivityStartedAt: Date | null;
};

export type LocalSeedPlan = {
  ownerId: OwnerId;
  activities: SeedActivityFixture[];
  dailyStats: SeedDailyStats[];
};

export type SeedLocalDevelopmentResult = {
  ownerId: OwnerId;
  activityCount: number;
  dailyStatCount: number;
};

function sum(numbers: number[]) {
  return numbers.reduce((total, value) => total + value, 0);
}

function average(numbers: number[]) {
  if (numbers.length === 0) {
    return null;
  }

  return Math.round(sum(numbers) / numbers.length);
}

function checksumSha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function createUtcDate(dayOffset: number, hour: number, minute: number) {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - dayOffset,
      hour,
      minute,
      0,
      0,
    ),
  );
}

function toStartOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildSeedActivities(ownerId: OwnerId): SeedActivityFixture[] {
  return [
    {
      key: "harbor-run",
      ownerId,
      source: "manual_upload",
      fileName: "harbor-run.fit",
      format: "fit",
      contentType: "application/octet-stream",
      fileContent: "local demo fit payload: harbor run",
      title: "Harbor Run",
      description: "Steady aerobic run with a short fast finish by the river.",
      sportType: "run",
      timezone: "Europe/Warsaw",
      startedAt: createUtcDate(1, 6, 30),
      distanceInMeters: 10200,
      movingTimeInSeconds: 3120,
      elapsedTimeInSeconds: 3300,
      totalElevationGainInMeters: 84,
      averageHeartRate: 148,
      averageSpeedInMetersPerSecond: 3.27,
      summaryPolyline: "gfo}EtohhUxD@bAxJmGF",
      startCoordinates: { latitude: 52.2297, longitude: 21.0122 },
      endCoordinates: { latitude: 52.2371, longitude: 21.0175 },
      comment: "Felt smooth throughout. The final 2 km picked up naturally.",
      streams: [
        {
          streamType: "time",
          resolution: "high",
          seriesType: "time",
          data: [0, 600, 1200, 1800, 2400, 3000],
          pointCount: 6,
          originalSize: 6,
        },
        {
          streamType: "heartrate",
          resolution: "high",
          seriesType: "time",
          data: [136, 142, 147, 150, 153, 158],
          pointCount: 6,
          originalSize: 6,
        },
        {
          streamType: "latlng",
          resolution: "high",
          seriesType: "distance",
          data: [
            [52.2297, 21.0122],
            [52.231, 21.0135],
            [52.2332, 21.0154],
            [52.2371, 21.0175],
          ],
          pointCount: 4,
          originalSize: 4,
        },
      ],
    },
    {
      key: "forest-ride",
      ownerId,
      source: "manual_upload",
      fileName: "forest-ride.tcx",
      format: "tcx",
      contentType: "application/xml",
      fileContent: "<TrainingCenterDatabase>forest ride demo</TrainingCenterDatabase>",
      title: "Forest Ride",
      description: "Rolling endurance ride on mixed gravel and smooth forest roads.",
      sportType: "ride",
      timezone: "Europe/Warsaw",
      startedAt: createUtcDate(2, 8, 15),
      distanceInMeters: 38600,
      movingTimeInSeconds: 5340,
      elapsedTimeInSeconds: 5700,
      totalElevationGainInMeters: 312,
      averageHeartRate: 139,
      averageSpeedInMetersPerSecond: 7.22,
      summaryPolyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
      startCoordinates: { latitude: 52.24, longitude: 21.01 },
      endCoordinates: { latitude: 52.281, longitude: 21.084 },
      comment: "Good endurance session. Cadence stayed relaxed on the flatter segments.",
      streams: [
        {
          streamType: "time",
          resolution: "high",
          seriesType: "time",
          data: [0, 900, 1800, 2700, 3600, 4500, 5340],
          pointCount: 7,
          originalSize: 7,
        },
        {
          streamType: "distance",
          resolution: "high",
          seriesType: "distance",
          data: [0, 6200, 12800, 19100, 25500, 32000, 38600],
          pointCount: 7,
          originalSize: 7,
        },
        {
          streamType: "latlng",
          resolution: "high",
          seriesType: "distance",
          data: [
            [52.24, 21.01],
            [52.248, 21.023],
            [52.259, 21.039],
            [52.271, 21.061],
            [52.281, 21.084],
          ],
          pointCount: 5,
          originalSize: 5,
        },
      ],
    },
    {
      key: "recovery-walk",
      ownerId,
      source: "manual_upload",
      fileName: "recovery-walk.gpx",
      format: "gpx",
      contentType: "application/gpx+xml",
      fileContent: "<gpx><trk><name>recovery walk demo</name></trk></gpx>",
      title: "Recovery Walk",
      description: "Easy walk to loosen up after the previous two days.",
      sportType: "walk",
      timezone: "Europe/Warsaw",
      startedAt: createUtcDate(1, 18, 10),
      distanceInMeters: 4200,
      movingTimeInSeconds: 2640,
      elapsedTimeInSeconds: 2760,
      totalElevationGainInMeters: 18,
      averageHeartRate: 101,
      averageSpeedInMetersPerSecond: 1.59,
      summaryPolyline: null,
      startCoordinates: { latitude: 52.225, longitude: 21.0 },
      endCoordinates: { latitude: 52.2215, longitude: 20.992 },
      comment: "Kept it genuinely easy. Useful for checking comments and daily totals.",
      streams: [
        {
          streamType: "time",
          resolution: "high",
          seriesType: "time",
          data: [0, 600, 1200, 1800, 2400, 2640],
          pointCount: 6,
          originalSize: 6,
        },
        {
          streamType: "latlng",
          resolution: "high",
          seriesType: "distance",
          data: [
            [52.225, 21.0],
            [52.2241, 20.9982],
            [52.2234, 20.9965],
            [52.2215, 20.992],
          ],
          pointCount: 4,
          originalSize: 4,
        },
      ],
    },
  ];
}

function buildDailyStats(activitiesToSeed: SeedActivityFixture[]): SeedDailyStats[] {
  const groupedActivities = new Map<string, SeedActivityFixture[]>();

  for (const activity of activitiesToSeed) {
    const activityDateKey = activity.startedAt.toISOString().slice(0, 10);
    const grouped = groupedActivities.get(activityDateKey) ?? [];

    grouped.push(activity);
    groupedActivities.set(activityDateKey, grouped);
  }

  return [...groupedActivities.entries()]
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([, grouped]) => {
      // Build daily rollups from the same seed activities so feed, detail, and stats fixtures cannot drift apart.
      const latestActivity = grouped.reduce((latest, activity) =>
        activity.startedAt > latest.startedAt ? activity : latest,
      );

      return {
        ownerId: grouped[0].ownerId,
        activityDate: toStartOfUtcDay(grouped[0].startedAt),
        timezone: grouped[0].timezone,
        activityCount: grouped.length,
        distanceInMeters: sum(grouped.map((activity) => activity.distanceInMeters)),
        movingTimeInSeconds: sum(
          grouped.map((activity) => activity.movingTimeInSeconds),
        ),
        elapsedTimeInSeconds: sum(
          grouped.map((activity) => activity.elapsedTimeInSeconds),
        ),
        totalElevationGainInMeters: sum(
          grouped.map((activity) => activity.totalElevationGainInMeters),
        ),
        averageHeartRate: average(
          grouped
            .map((activity) => activity.averageHeartRate)
            .filter((heartRate): heartRate is number => heartRate !== null),
        ),
        lastActivityStartedAt: latestActivity.startedAt,
      };
    });
}

/** Builds the deterministic local seed plan used by the Phase 1 bootstrap workflow. */
export function buildLocalSeedPlan(
  ownerId: OwnerId = LOCAL_DEFAULT_OWNER_ID,
): LocalSeedPlan {
  const seedActivities = buildSeedActivities(ownerId);

  return {
    ownerId,
    activities: seedActivities,
    dailyStats: buildDailyStats(seedActivities),
  };
}

/** Seeds owner-scoped demo data without faking any Strava connection state. */
export async function seedLocalDevelopmentData(): Promise<SeedLocalDevelopmentResult> {
  const localDevelopment = getLocalDevelopmentSummary();
  const seedPlan = buildLocalSeedPlan(localDevelopment.seedOwnerId);

  await db.transaction(async (tx) => {
    await tx
      .delete(dailyActivityStats)
      .where(eq(dailyActivityStats.ownerId, seedPlan.ownerId));
    await tx.delete(activityComments).where(eq(activityComments.ownerId, seedPlan.ownerId));
    await tx.delete(activityStreams).where(eq(activityStreams.ownerId, seedPlan.ownerId));
    await tx.delete(activities).where(eq(activities.ownerId, seedPlan.ownerId));
    await tx.delete(activityImports).where(eq(activityImports.ownerId, seedPlan.ownerId));

    for (const seedActivity of seedPlan.activities) {
      const [activityImport] = await tx
        .insert(activityImports)
        .values({
          ownerId: seedActivity.ownerId,
          source: seedActivity.source,
          format: seedActivity.format,
          status: "completed",
          originalFileName: seedActivity.fileName,
          contentType: seedActivity.contentType,
          checksumSha256: checksumSha256(seedActivity.fileContent),
          fileSizeBytes: Buffer.byteLength(seedActivity.fileContent),
          startedAt: seedActivity.startedAt,
          completedAt: seedActivity.startedAt,
        })
        .returning({ id: activityImports.id });

      const [activity] = await tx
        .insert(activities)
        .values({
          ownerId: seedActivity.ownerId,
          source: seedActivity.source,
          importId: activityImport.id,
          title: seedActivity.title,
          description: seedActivity.description,
          sportType: seedActivity.sportType,
          timezone: seedActivity.timezone,
          startedAt: seedActivity.startedAt,
          distanceInMeters: seedActivity.distanceInMeters,
          movingTimeInSeconds: seedActivity.movingTimeInSeconds,
          elapsedTimeInSeconds: seedActivity.elapsedTimeInSeconds,
          totalElevationGainInMeters: seedActivity.totalElevationGainInMeters,
          averageHeartRate: seedActivity.averageHeartRate,
          averageSpeedInMetersPerSecond:
            seedActivity.averageSpeedInMetersPerSecond,
          summaryPolyline: seedActivity.summaryPolyline,
          startLatitude: seedActivity.startCoordinates?.latitude ?? null,
          startLongitude: seedActivity.startCoordinates?.longitude ?? null,
          endLatitude: seedActivity.endCoordinates?.latitude ?? null,
          endLongitude: seedActivity.endCoordinates?.longitude ?? null,
          lastSynchronizedAt: seedActivity.startedAt,
        })
        .returning({ id: activities.id });

      await tx.insert(activityComments).values({
        ownerId: seedActivity.ownerId,
        activityId: activity.id,
        body: seedActivity.comment,
      });

      if (seedActivity.streams.length > 0) {
        await tx.insert(activityStreams).values(
          seedActivity.streams.map((stream) => ({
            ownerId: seedActivity.ownerId,
            activityId: activity.id,
            streamType: stream.streamType,
            resolution: stream.resolution,
            seriesType: stream.seriesType,
            originalSize: stream.originalSize,
            pointCount: stream.pointCount,
            data: stream.data,
          })),
        );
      }
    }

    await tx.insert(dailyActivityStats).values(
      seedPlan.dailyStats.map((dailyStat) => ({
        ownerId: dailyStat.ownerId,
        activityDate: dailyStat.activityDate,
        timezone: dailyStat.timezone,
        activityCount: dailyStat.activityCount,
        distanceInMeters: dailyStat.distanceInMeters,
        movingTimeInSeconds: dailyStat.movingTimeInSeconds,
        elapsedTimeInSeconds: dailyStat.elapsedTimeInSeconds,
        totalElevationGainInMeters: dailyStat.totalElevationGainInMeters,
        averageHeartRate: dailyStat.averageHeartRate,
        lastActivityStartedAt: dailyStat.lastActivityStartedAt,
      })),
    );
  });

  return {
    ownerId: seedPlan.ownerId,
    activityCount: seedPlan.activities.length,
    dailyStatCount: seedPlan.dailyStats.length,
  };
}
