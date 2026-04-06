ALTER TABLE "users" ADD COLUMN "firebase_uid" text;
--> statement-breakpoint
UPDATE "users" SET "firebase_uid" = CONCAT('legacy_user_', "id"::text) WHERE "firebase_uid" IS NULL;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "firebase_uid" SET NOT NULL;
--> statement-breakpoint
DROP INDEX "users_username_unique";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "username";
--> statement-breakpoint
CREATE UNIQUE INDEX "users_firebase_uid_unique" ON "users" USING btree ("firebase_uid");
