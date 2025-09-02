CREATE TABLE "competition_results" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"audio_id" text NOT NULL,
	"wpm" integer NOT NULL,
	"precision_percent" integer NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "competition_results" ADD CONSTRAINT "competition_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "competition_results_user_id_idx" ON "competition_results" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "competition_results_audio_id_idx" ON "competition_results" USING btree ("audio_id");
