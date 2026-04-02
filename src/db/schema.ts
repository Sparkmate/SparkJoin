import {
	boolean,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const config = pgTable("config", {
	id: serial("id").primaryKey(),
	key: text("key").notNull(),
	value: jsonb("value").notNull(),
});

export const pages = pgTable("pages", {
	id: serial("id").primaryKey(),
	key: text("key").notNull(),
	value: jsonb("value").notNull(),
});

export const candidateProcesses = pgTable("candidate_processes", {
	id: serial("id").primaryKey(),
	userId: text("user_id").notNull().unique(),
	candidateEmail: text("candidate_email").notNull(),
	currentStageKey: text("current_stage_key")
		.notNull()
		.default("application_instructions_sent"),
	completedStageKeys: text("completed_stage_keys")
		.array()
		.notNull()
		.default([]),
	outcome: text("outcome").notNull().default("in_progress"),
	cultureFitScore: integer("culture_fit_score"),
	firstInterviewerEmail: text("first_interviewer_email"),
	rejectionFeedback: text("rejection_feedback"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const candidateProfiles = pgTable("candidate_profiles", {
	id: serial("id").primaryKey(),
	userId: text("user_id").notNull().unique(),
	candidateEmail: text("candidate_email").notNull(),
	fullName: text("full_name").notNull().default(""),
	preferredName: text("preferred_name"),
	phone: text("phone"),
	currentLocation: text("current_location"),
	linkedinUrl: text("linkedin_url"),
	githubUrl: text("github_url"),
	portfolioLinks: text("portfolio_links").array().notNull().default([]),
	workSampleLinks: text("work_sample_links").array().notNull().default([]),
	portfolioDocumentUrls: text("portfolio_document_urls")
		.array()
		.notNull()
		.default([]),
	workSampleDocumentUrls: text("work_sample_document_urls")
		.array()
		.notNull()
		.default([]),
	proofOfWorkSummary: text("proof_of_work_summary"),
	biggestAchievement: text("biggest_achievement"),
	whySparkmate: text("why_sparkmate"),
	buildStrengths: text("build_strengths").array().notNull().default([]),
	workAuthorization: text("work_authorization"),
	earliestStartDate: text("earliest_start_date"),
	interviewAvailability: text("interview_availability"),
	canAttendHongKongOnsite: boolean("can_attend_hong_kong_onsite")
		.notNull()
		.default(false),
	additionalContext: text("additional_context"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
