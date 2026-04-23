-- Candidate model simplification and hiring pipeline tables.

-- 1) Replace candidate_profiles -> candidates (keeping existing data where possible)
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.tables
		WHERE table_schema = 'public' AND table_name = 'candidate_profiles'
	) AND NOT EXISTS (
		SELECT 1
		FROM information_schema.tables
		WHERE table_schema = 'public' AND table_name = 'candidates'
	) THEN
		ALTER TABLE "candidate_profiles" RENAME TO "candidates";
	END IF;
END $$;

CREATE TABLE IF NOT EXISTS "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text DEFAULT '' NOT NULL,
	"preferred_name" text,
	"phone" text,
	"current_location" text,
	"position" text DEFAULT '' NOT NULL,
	"links" text[] DEFAULT '{}' NOT NULL,
	"proof_of_work_summary" text,
	"biggest_achievement" text,
	"why_sparkmate" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'candidates' AND column_name = 'candidate_email'
	) THEN
		-- Merge all historical links/doc urls into the new links[] column before dropping old columns.
		UPDATE "candidates"
		SET "links" = ARRAY(
			SELECT DISTINCT item
			FROM unnest(
				COALESCE("portfolio_links", ARRAY[]::text[]) ||
				COALESCE("work_sample_links", ARRAY[]::text[]) ||
				COALESCE("portfolio_document_urls", ARRAY[]::text[]) ||
				COALESCE("work_sample_document_urls", ARRAY[]::text[]) ||
				COALESCE(ARRAY["linkedin_url"], ARRAY[]::text[]) ||
				COALESCE(ARRAY["github_url"], ARRAY[]::text[])
			) item
			WHERE item IS NOT NULL AND btrim(item) <> ''
		)
		WHERE "links" = '{}'::text[] OR "links" IS NULL;

		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "candidate_email";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "linkedin_url";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "github_url";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "portfolio_links";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "work_sample_links";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "build_strengths";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "work_authorization";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "earliest_start_date";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "interview_availability";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "can_attend_hong_kong_onsite";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "additional_context";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "portfolio_document_urls";
		ALTER TABLE "candidates" DROP COLUMN IF EXISTS "work_sample_document_urls";
	END IF;
END $$;

ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "position" text DEFAULT '' NOT NULL;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "links" text[] DEFAULT '{}' NOT NULL;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "note" text;

ALTER TABLE "candidates" DROP CONSTRAINT IF EXISTS "candidate_profiles_user_id_unique";
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_user_id_unique" UNIQUE("user_id");

-- 2) Remove old process table
DROP TABLE IF EXISTS "candidate_processes";

-- 3) Create emails table
CREATE TABLE IF NOT EXISTS "emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"direction" text NOT NULL,
	"short_summary" text NOT NULL,
	"message_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "emails_candidate_id_candidates_id_fk"
		FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id")
		ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "emails_message_id_unique" UNIQUE("message_id")
);

-- 4) Create hiring step tables
CREATE TABLE IF NOT EXISTS "hiring_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	"is_terminal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hiring_steps_key_unique" UNIQUE("key")
);

CREATE TABLE IF NOT EXISTS "candidate_step_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"step_key" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"note" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidate_step_status_candidate_id_candidates_id_fk"
		FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id")
		ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "candidate_step_status_step_key_hiring_steps_key_fk"
		FOREIGN KEY ("step_key") REFERENCES "public"."hiring_steps"("key")
		ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "candidate_step_status_candidate_step_unique" UNIQUE("candidate_id", "step_key")
);
