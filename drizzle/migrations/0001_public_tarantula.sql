DROP INDEX "activity_comments_owner_activity_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "activity_comments_activity_id_unique" ON "activity_comments" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "activity_comments_owner_id_idx" ON "activity_comments" USING btree ("owner_id");