import { pgEnum } from "drizzle-orm/pg-core";

export const activitySourceEnum = pgEnum("activity_source", [
  "strava",
  "manual_upload",
]);

export const activityImportFormatEnum = pgEnum("activity_import_format", [
  "fit",
  "tcx",
  "gpx",
]);

export const activityImportStatusEnum = pgEnum("activity_import_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const activityStreamTypeEnum = pgEnum("activity_stream_type", [
  "time",
  "distance",
  "latlng",
  "altitude",
  "velocity_smooth",
  "heartrate",
  "cadence",
  "watts",
  "temp",
  "moving",
  "grade_smooth",
]);

export const webhookProcessingStatusEnum = pgEnum("webhook_processing_status", [
  "pending",
  "processing",
  "processed",
  "ignored",
  "failed",
]);
