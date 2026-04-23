import {
	boolean,
	date,
	foreignKey,
	index,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const verification = pgTable(
	"verification",
	{
		id: text().primaryKey().notNull(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("verification_identifier_idx").using(
			"btree",
			table.identifier.asc().nullsLast().op("text_ops"),
		),
	],
);

export const account = pgTable(
	"account",
	{
		id: text().primaryKey().notNull(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id").notNull(),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", {
			mode: "string",
		}),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			mode: "string",
		}),
		scope: text(),
		password: text(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
	},
	(table) => [
		index("account_userId_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("text_ops"),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk",
		}).onDelete("cascade"),
	],
);

export const config = pgTable(
	"config",
	{
		id: serial().primaryKey().notNull(),
		key: text().notNull(),
		value: jsonb().notNull(),
	},
	(table) => [
		uniqueIndex("config_key_idx").using(
			"btree",
			table.key.asc().nullsLast().op("text_ops"),
		),
	],
);

export const pages = pgTable(
	"pages",
	{
		id: serial().primaryKey().notNull(),
		key: text().notNull(),
		value: jsonb().notNull(),
	},
	(table) => [
		uniqueIndex("pages_key_idx").using(
			"btree",
			table.key.asc().nullsLast().op("text_ops"),
		),
	],
);

export const candidates = pgTable(
	"candidates",
	{
		id: serial().primaryKey().notNull(),
		userId: text("user_id").notNull(),
		fullName: text("full_name").default("").notNull(),
		preferredName: text("preferred_name"),
		phone: text(),
		currentLocation: text("current_location"),
		position: text().default("").notNull(),
		links: text().array().default([]).notNull(),
		proofOfWorkSummary: text("proof_of_work_summary"),
		biggestAchievement: text("biggest_achievement"),
		whySparkmate: text("why_sparkmate"),
		note: text(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [unique("candidates_user_id_unique").on(table.userId)],
);

export const emails = pgTable(
	"emails",
	{
		id: serial().primaryKey().notNull(),
		candidateId: integer("candidate_id").notNull(),
		direction: text().notNull(),
		shortSummary: text("short_summary").notNull(),
		messageId: text("message_id").notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.candidateId],
			foreignColumns: [candidates.id],
			name: "emails_candidate_id_candidates_id_fk",
		}).onDelete("cascade"),
		unique("emails_message_id_unique").on(table.messageId),
	],
);

export const hiringSteps = pgTable(
	"hiring_steps",
	{
		id: serial().primaryKey().notNull(),
		key: text().notNull(),
		name: text().notNull(),
		description: text().notNull(),
		position: integer().notNull(),
		isTerminal: boolean("is_terminal").default(false).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [unique("hiring_steps_key_unique").on(table.key)],
);

export const candidateStepStatus = pgTable(
	"candidate_step_status",
	{
		id: serial().primaryKey().notNull(),
		candidateId: integer("candidate_id").notNull(),
		stepKey: text("step_key").notNull(),
		status: text().default("pending").notNull(),
		note: text(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.candidateId],
			foreignColumns: [candidates.id],
			name: "candidate_step_status_candidate_id_candidates_id_fk",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.stepKey],
			foreignColumns: [hiringSteps.key],
			name: "candidate_step_status_step_key_hiring_steps_key_fk",
		}).onDelete("cascade"),
		unique("candidate_step_status_candidate_step_unique").on(
			table.candidateId,
			table.stepKey,
		),
	],
);

export const session = pgTable(
	"session",
	{
		id: text().primaryKey().notNull(),
		expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
		token: text().notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id").notNull(),
		impersonatedBy: text("impersonated_by"),
	},
	(table) => [
		index("session_userId_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("text_ops"),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk",
		}).onDelete("cascade"),
		unique("session_token_unique").on(table.token),
	],
);

export const oauthAccessToken = pgTable(
	"oauth_access_token",
	{
		id: text().primaryKey().notNull(),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", {
			mode: "string",
		}),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			mode: "string",
		}),
		clientId: text("client_id"),
		userId: text("user_id"),
		scopes: text(),
		createdAt: timestamp("created_at", { mode: "string" }),
		updatedAt: timestamp("updated_at", { mode: "string" }),
	},
	(table) => [
		index("oauthAccessToken_clientId_idx").using(
			"btree",
			table.clientId.asc().nullsLast().op("text_ops"),
		),
		index("oauthAccessToken_userId_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("text_ops"),
		),
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [oauthApplication.clientId],
			name: "oauth_access_token_client_id_oauth_application_client_id_fk",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "oauth_access_token_user_id_user_id_fk",
		}).onDelete("cascade"),
		unique("oauth_access_token_access_token_unique").on(table.accessToken),
		unique("oauth_access_token_refresh_token_unique").on(table.refreshToken),
	],
);

export const oauthApplication = pgTable(
	"oauth_application",
	{
		id: text().primaryKey().notNull(),
		name: text(),
		icon: text(),
		metadata: text(),
		clientId: text("client_id"),
		clientSecret: text("client_secret"),
		redirectUrls: text("redirect_urls"),
		type: text(),
		disabled: boolean().default(false),
		userId: text("user_id"),
		createdAt: timestamp("created_at", { mode: "string" }),
		updatedAt: timestamp("updated_at", { mode: "string" }),
	},
	(table) => [
		index("oauthApplication_userId_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("text_ops"),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "oauth_application_user_id_user_id_fk",
		}).onDelete("cascade"),
		unique("oauth_application_client_id_unique").on(table.clientId),
	],
);

export const oauthConsent = pgTable(
	"oauth_consent",
	{
		id: text().primaryKey().notNull(),
		clientId: text("client_id"),
		userId: text("user_id"),
		scopes: text(),
		createdAt: timestamp("created_at", { mode: "string" }),
		updatedAt: timestamp("updated_at", { mode: "string" }),
		consentGiven: boolean("consent_given"),
	},
	(table) => [
		index("oauthConsent_clientId_idx").using(
			"btree",
			table.clientId.asc().nullsLast().op("text_ops"),
		),
		index("oauthConsent_userId_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("text_ops"),
		),
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [oauthApplication.clientId],
			name: "oauth_consent_client_id_oauth_application_client_id_fk",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "oauth_consent_user_id_user_id_fk",
		}).onDelete("cascade"),
	],
);

export const teammates = pgTable(
	"teammates",
	{
		id: text().primaryKey().notNull(),
		userId: text("user_id"),
		primaryEmail: text("primary_email").notNull(),
		personalEmail: text("personal_email"),
		fullName: text("full_name").default("").notNull(),
		givenName: text("given_name").default("").notNull(),
		familyName: text("family_name").default("").notNull(),
		title: text().default("").notNull(),
		location: text().default("").notNull(),
		phone: text().default("").notNull(),
		belt: text(),
		experience: text(),
		speciality: text(),
		startDate: date("start_date"),
		contractType: text("contract_type"),
		description: text(),
		photoUrl: text("photo_url"),
		suspended: boolean().default(false).notNull(),
		syncedAt: timestamp("synced_at", { mode: "string" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		uniqueIndex("teammates_primary_email_idx").using(
			"btree",
			table.primaryEmail.asc().nullsLast().op("text_ops"),
		),
		uniqueIndex("teammates_user_id_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("text_ops"),
		),
	],
);

export const teammateLegalForms = pgTable(
	"teammate_legal_forms",
	{
		teammateId: text("teammate_id").primaryKey().notNull(),
		employeeId: text("employee_id"),
		firstName: text("first_name"),
		lastName: text("last_name"),
		legalFirstName: text("legal_first_name"),
		legalLastName: text("legal_last_name"),
		chineseName: text("chinese_name"),
		email: text(),
		personalEmail: text("personal_email"),
		contactNumber: text("contact_number"),
		birthDate: date("birth_date"),
		gender: text(),
		maritalStatus: text("marital_status"),
		hkidNumber: text("hkid_number"),
		visaType: text("visa_type"),
		visaNumber: text("visa_number"),
		visaIssueDate: date("visa_issue_date"),
		visaExpiryDate: date("visa_expiry_date"),
		passportNo: text("passport_no"),
		passportIssueDate: date("passport_issue_date"),
		passportExpiryDate: date("passport_expiry_date"),
		passportPlaceOfIssue: text("passport_place_of_issue"),
		jobTitle: text("job_title"),
		jobStartDate: date("job_start_date"),
		rateOfPay: text("rate_of_pay"),
		currencyOfSalary: text("currency_of_salary"),
		grossSalary: text("gross_salary"),
		netSalary: text("net_salary"),
		bankName: text("bank_name"),
		bankAccountHolderName: text("bank_account_holder_name"),
		bankAccountNo: text("bank_account_no"),
		fpsId: text("fps_id"),
		streetAddress: text("street_address"),
		buildingName: text("building_name"),
		floorNumber: text("floor_number"),
		unitNumber: text("unit_number"),
		district: text(),
		postalCode: text("postal_code"),
		country: text(),
		spouseFullName: text("spouse_full_name"),
		spouseHkidOrPassport: text("spouse_hkid_or_passport"),
		spousePassportPlaceOfIssue: text("spouse_passport_place_of_issue"),
		submittedAt: timestamp("submitted_at", { mode: "string" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("teammate_legal_forms_submitted_idx").using(
			"btree",
			table.submittedAt.asc().nullsLast().op("timestamp_ops"),
		),
		foreignKey({
			columns: [table.teammateId],
			foreignColumns: [teammates.id],
			name: "teammate_legal_forms_teammate_id_teammates_id_fk",
		}).onDelete("cascade"),
	],
);

export const user = pgTable(
	"user",
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		email: text().notNull(),
		emailVerified: boolean("email_verified").default(false).notNull(),
		image: text(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		expiresAt: timestamp("expires_at", { mode: "string" }),
		pagesRead: text("pages_read").array().default([""]),
		role: text(),
		banned: boolean().default(false),
		banReason: text("ban_reason"),
		banExpires: timestamp("ban_expires", { mode: "string" }),
	},
	(table) => [unique("user_email_unique").on(table.email)],
);
