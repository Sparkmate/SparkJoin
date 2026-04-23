-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "config" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_processes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"candidate_email" text NOT NULL,
	"current_stage_key" text DEFAULT 'application_instructions_sent' NOT NULL,
	"completed_stage_keys" text[] DEFAULT '{""}' NOT NULL,
	"outcome" text DEFAULT 'in_progress' NOT NULL,
	"culture_fit_score" integer,
	"first_interviewer_email" text,
	"rejection_feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidate_processes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "candidate_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"candidate_email" text NOT NULL,
	"full_name" text DEFAULT '' NOT NULL,
	"preferred_name" text,
	"phone" text,
	"current_location" text,
	"linkedin_url" text,
	"github_url" text,
	"portfolio_links" text[] DEFAULT '{""}' NOT NULL,
	"work_sample_links" text[] DEFAULT '{""}' NOT NULL,
	"proof_of_work_summary" text,
	"biggest_achievement" text,
	"why_sparkmate" text,
	"build_strengths" text[] DEFAULT '{""}' NOT NULL,
	"work_authorization" text,
	"earliest_start_date" text,
	"interview_availability" text,
	"can_attend_hong_kong_onsite" boolean DEFAULT false NOT NULL,
	"additional_context" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"portfolio_document_urls" text[] DEFAULT '{""}' NOT NULL,
	"work_sample_document_urls" text[] DEFAULT '{""}' NOT NULL,
	CONSTRAINT "candidate_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "oauth_access_token" (
	"id" text PRIMARY KEY NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"client_id" text,
	"user_id" text,
	"scopes" text,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "oauth_access_token_access_token_unique" UNIQUE("access_token"),
	CONSTRAINT "oauth_access_token_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "oauth_application" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"icon" text,
	"metadata" text,
	"client_id" text,
	"client_secret" text,
	"redirect_urls" text,
	"type" text,
	"disabled" boolean DEFAULT false,
	"user_id" text,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "oauth_application_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "oauth_consent" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text,
	"user_id" text,
	"scopes" text,
	"created_at" timestamp,
	"updated_at" timestamp,
	"consent_given" boolean
);
--> statement-breakpoint
CREATE TABLE "teammates" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"primary_email" text NOT NULL,
	"personal_email" text,
	"full_name" text DEFAULT '' NOT NULL,
	"given_name" text DEFAULT '' NOT NULL,
	"family_name" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"belt" text,
	"experience" text,
	"speciality" text,
	"start_date" date,
	"contract_type" text,
	"description" text,
	"photo_url" text,
	"suspended" boolean DEFAULT false NOT NULL,
	"synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teammate_legal_forms" (
	"teammate_id" text PRIMARY KEY NOT NULL,
	"employee_id" text,
	"first_name" text,
	"last_name" text,
	"legal_first_name" text,
	"legal_last_name" text,
	"chinese_name" text,
	"email" text,
	"personal_email" text,
	"contact_number" text,
	"birth_date" date,
	"gender" text,
	"marital_status" text,
	"hkid_number" text,
	"visa_type" text,
	"visa_number" text,
	"visa_issue_date" date,
	"visa_expiry_date" date,
	"passport_no" text,
	"passport_issue_date" date,
	"passport_expiry_date" date,
	"passport_place_of_issue" text,
	"job_title" text,
	"job_start_date" date,
	"rate_of_pay" text,
	"currency_of_salary" text,
	"gross_salary" text,
	"net_salary" text,
	"bank_name" text,
	"bank_account_holder_name" text,
	"bank_account_no" text,
	"fps_id" text,
	"street_address" text,
	"building_name" text,
	"floor_number" text,
	"unit_number" text,
	"district" text,
	"postal_code" text,
	"country" text,
	"spouse_full_name" text,
	"spouse_hkid_or_passport" text,
	"spouse_passport_place_of_issue" text,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"pages_read" text[] DEFAULT '{""}',
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_client_id_oauth_application_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."oauth_application"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_application" ADD CONSTRAINT "oauth_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_consent" ADD CONSTRAINT "oauth_consent_client_id_oauth_application_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."oauth_application"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_consent" ADD CONSTRAINT "oauth_consent_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teammate_legal_forms" ADD CONSTRAINT "teammate_legal_forms_teammate_id_teammates_id_fk" FOREIGN KEY ("teammate_id") REFERENCES "public"."teammates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier" text_ops);--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "config_key_idx" ON "config" USING btree ("key" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "pages_key_idx" ON "pages" USING btree ("key" text_ops);--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "oauthAccessToken_clientId_idx" ON "oauth_access_token" USING btree ("client_id" text_ops);--> statement-breakpoint
CREATE INDEX "oauthAccessToken_userId_idx" ON "oauth_access_token" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "oauthApplication_userId_idx" ON "oauth_application" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "oauthConsent_clientId_idx" ON "oauth_consent" USING btree ("client_id" text_ops);--> statement-breakpoint
CREATE INDEX "oauthConsent_userId_idx" ON "oauth_consent" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "teammates_primary_email_idx" ON "teammates" USING btree ("primary_email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "teammates_user_id_idx" ON "teammates" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "teammate_legal_forms_submitted_idx" ON "teammate_legal_forms" USING btree ("submitted_at" timestamp_ops);
*/