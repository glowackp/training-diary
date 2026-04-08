ALTER TABLE "strava_connections" ADD COLUMN "token_encryption_key_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_source_integrity_check" CHECK ((
        ("activities"."source" = 'strava' and "activities"."source_activity_id" is not null and "activities"."strava_connection_id" is not null)
        or
        ("activities"."source" = 'manual_upload' and "activities"."import_id" is not null)
      ));--> statement-breakpoint
ALTER TABLE "activity_imports" ADD CONSTRAINT "activity_imports_source_integrity_check" CHECK ((
        ("activity_imports"."source" = 'manual_upload' and "activity_imports"."checksum_sha256" is not null)
        or
        ("activity_imports"."source" = 'strava' and "activity_imports"."source_activity_id" is not null)
      ));