CREATE TYPE "public"."activity_import_format" AS ENUM('fit', 'tcx', 'gpx');--> statement-breakpoint
CREATE TYPE "public"."activity_import_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."activity_source" AS ENUM('strava', 'manual_upload');--> statement-breakpoint
CREATE TYPE "public"."activity_stream_type" AS ENUM('time', 'distance', 'latlng', 'altitude', 'velocity_smooth', 'heartrate', 'cadence', 'watts', 'temp', 'moving', 'grade_smooth');--> statement-breakpoint
CREATE TYPE "public"."webhook_processing_status" AS ENUM('pending', 'processing', 'processed', 'ignored', 'failed');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"source" "activity_source" NOT NULL,
	"source_activity_id" varchar(255),
	"strava_connection_id" uuid,
	"import_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"sport_type" varchar(64) NOT NULL,
	"timezone" varchar(64),
	"started_at" timestamp with time zone NOT NULL,
	"distance_in_meters" integer DEFAULT 0 NOT NULL,
	"moving_time_in_seconds" integer DEFAULT 0 NOT NULL,
	"elapsed_time_in_seconds" integer DEFAULT 0 NOT NULL,
	"total_elevation_gain_in_meters" integer DEFAULT 0 NOT NULL,
	"average_heart_rate" integer,
	"average_speed_in_meters_per_second" double precision,
	"summary_polyline" text,
	"start_latitude" double precision,
	"start_longitude" double precision,
	"end_latitude" double precision,
	"end_longitude" double precision,
	"is_private" boolean DEFAULT false NOT NULL,
	"last_synchronized_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"activity_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"source" "activity_source" NOT NULL,
	"format" "activity_import_format",
	"status" "activity_import_status" DEFAULT 'pending' NOT NULL,
	"original_file_name" varchar(255),
	"content_type" varchar(255),
	"storage_path" text,
	"checksum_sha256" varchar(128),
	"file_size_bytes" integer,
	"source_activity_id" varchar(255),
	"failure_reason" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"activity_id" uuid NOT NULL,
	"stream_type" "activity_stream_type" NOT NULL,
	"resolution" varchar(32),
	"series_type" varchar(32),
	"original_size" integer,
	"point_count" integer DEFAULT 0 NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_activity_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"activity_date" date NOT NULL,
	"timezone" varchar(64),
	"activity_count" integer DEFAULT 0 NOT NULL,
	"distance_in_meters" integer DEFAULT 0 NOT NULL,
	"moving_time_in_seconds" integer DEFAULT 0 NOT NULL,
	"elapsed_time_in_seconds" integer DEFAULT 0 NOT NULL,
	"total_elevation_gain_in_meters" integer DEFAULT 0 NOT NULL,
	"average_heart_rate" integer,
	"last_activity_started_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strava_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"strava_athlete_id" bigint NOT NULL,
	"athlete_username" varchar(255),
	"athlete_display_name" varchar(255),
	"scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"encrypted_access_token" varchar(2048) NOT NULL,
	"encrypted_refresh_token" varchar(2048) NOT NULL,
	"access_token_expires_at" timestamp with time zone NOT NULL,
	"last_successful_sync_at" timestamp with time zone,
	"last_webhook_event_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strava_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(128),
	"strava_connection_id" uuid,
	"subscription_id" integer NOT NULL,
	"strava_athlete_id" bigint,
	"object_type" varchar(32) NOT NULL,
	"object_id" bigint NOT NULL,
	"aspect_type" varchar(32) NOT NULL,
	"event_time" timestamp with time zone NOT NULL,
	"updates" jsonb,
	"payload" jsonb NOT NULL,
	"processing_status" "webhook_processing_status" DEFAULT 'pending' NOT NULL,
	"processing_attempt_count" integer DEFAULT 0 NOT NULL,
	"processed_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_strava_connection_id_strava_connections_id_fk" FOREIGN KEY ("strava_connection_id") REFERENCES "public"."strava_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_import_id_activity_imports_id_fk" FOREIGN KEY ("import_id") REFERENCES "public"."activity_imports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_comments" ADD CONSTRAINT "activity_comments_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_streams" ADD CONSTRAINT "activity_streams_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strava_webhook_events" ADD CONSTRAINT "strava_webhook_events_strava_connection_id_strava_connections_id_fk" FOREIGN KEY ("strava_connection_id") REFERENCES "public"."strava_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "activities_owner_source_activity_id_unique" ON "activities" USING btree ("owner_id","source","source_activity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "activities_import_id_unique" ON "activities" USING btree ("import_id");--> statement-breakpoint
CREATE INDEX "activities_owner_started_at_idx" ON "activities" USING btree ("owner_id","started_at");--> statement-breakpoint
CREATE INDEX "activities_owner_sport_type_idx" ON "activities" USING btree ("owner_id","sport_type");--> statement-breakpoint
CREATE INDEX "activities_strava_connection_id_idx" ON "activities" USING btree ("strava_connection_id");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_comments_owner_activity_unique" ON "activity_comments" USING btree ("owner_id","activity_id");--> statement-breakpoint
CREATE INDEX "activity_comments_activity_idx" ON "activity_comments" USING btree ("activity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_imports_owner_checksum_unique" ON "activity_imports" USING btree ("owner_id","checksum_sha256");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_imports_owner_source_activity_id_unique" ON "activity_imports" USING btree ("owner_id","source","source_activity_id");--> statement-breakpoint
CREATE INDEX "activity_imports_owner_status_idx" ON "activity_imports" USING btree ("owner_id","status");--> statement-breakpoint
CREATE INDEX "activity_imports_owner_created_idx" ON "activity_imports" USING btree ("owner_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_streams_activity_id_stream_type_unique" ON "activity_streams" USING btree ("activity_id","stream_type");--> statement-breakpoint
CREATE INDEX "activity_streams_owner_activity_idx" ON "activity_streams" USING btree ("owner_id","activity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_activity_stats_owner_date_unique" ON "daily_activity_stats" USING btree ("owner_id","activity_date");--> statement-breakpoint
CREATE INDEX "daily_activity_stats_owner_date_idx" ON "daily_activity_stats" USING btree ("owner_id","activity_date");--> statement-breakpoint
CREATE UNIQUE INDEX "strava_connections_owner_id_unique" ON "strava_connections" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "strava_connections_strava_athlete_id_unique" ON "strava_connections" USING btree ("strava_athlete_id");--> statement-breakpoint
CREATE INDEX "strava_connections_owner_active_idx" ON "strava_connections" USING btree ("owner_id","is_active");--> statement-breakpoint
CREATE INDEX "strava_connections_token_expiry_idx" ON "strava_connections" USING btree ("access_token_expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "strava_webhook_events_fingerprint_unique" ON "strava_webhook_events" USING btree ("subscription_id","object_type","object_id","aspect_type","event_time");--> statement-breakpoint
CREATE INDEX "strava_webhook_events_processing_idx" ON "strava_webhook_events" USING btree ("processing_status","event_time");--> statement-breakpoint
CREATE INDEX "strava_webhook_events_owner_event_idx" ON "strava_webhook_events" USING btree ("owner_id","event_time");--> statement-breakpoint
CREATE INDEX "strava_webhook_events_athlete_idx" ON "strava_webhook_events" USING btree ("strava_athlete_id");