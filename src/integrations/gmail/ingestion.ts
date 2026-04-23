import type { GoogleGenAI } from "@google/genai";
import { eq, inArray } from "drizzle-orm";
import { db } from "#/db";
import { candidateStepStatus, candidates, emails, hiringSteps, user } from "#/db/schema";
import { fetchLatestGmailMessageSnapshot } from "./client";
import {
	EXISTING_CANDIDATE_ANALYSIS_SCHEMA,
	generateAndParseJson,
	UNKNOWN_CANDIDATE_ANALYSIS_SCHEMA,
} from "./llm";
import { collectCandidateEmails } from "./parser";
import {
	buildExistingCandidatePrompt,
	buildUnknownCandidatePrompt,
} from "./prompts";
import type { GmailPushData } from "./types";
import { appendNote, hasValue, normalizeLinks, toNullable } from "./utils";

export async function ingestGmailWebhook(
	gmailData: GmailPushData,
	ai: GoogleGenAI,
): Promise<void> {
	const message = await fetchLatestGmailMessageSnapshot(gmailData);
	if (!message.gmailMessageId) return;

	const [alreadyIngested] = await db
		.select({ id: emails.id })
		.from(emails)
		.where(eq(emails.messageId, message.gmailMessageId))
		.limit(1);

	if (alreadyIngested) return;

	const candidateEmails = collectCandidateEmails(message);
	const uniqueCandidateEmails = [...new Set(candidateEmails.map((c) => c.email))];
	const existingUserEmails = new Set<string>();

	if (uniqueCandidateEmails.length > 0) {
		const matchedUsers = await db
			.select({ email: user.email })
			.from(user)
			.where(inArray(user.email, uniqueCandidateEmails));

		for (const matchedUser of matchedUsers) {
			existingUserEmails.add(matchedUser.email.toLowerCase());
		}
	}

	for (const candidateEmail of candidateEmails) {
		const existsInUsersTable = existingUserEmails.has(candidateEmail.email);

		if (existsInUsersTable) {
			await ingestForExistingCandidate({ ai, candidateEmail, message });
			continue;
		}

		await ingestForUnknownCandidate({ ai, candidateEmail, message });
	}
}

async function ingestForExistingCandidate({
	ai,
	candidateEmail,
	message,
}: {
	ai: GoogleGenAI;
	candidateEmail: { email: string; direction: "inbound" | "outbound" };
	message: {
		gmailMessageId: string | null;
		sender: string | null;
		receiver: string | null;
		cc: string | null;
		bcc: string | null;
		body: string | null;
	};
}) {
	const [candidateUser] = await db
		.select({ id: user.id, email: user.email, name: user.name })
		.from(user)
		.where(eq(user.email, candidateEmail.email))
		.limit(1);

	if (!candidateUser) return;

	const [existingCandidateRecord] = await db
		.select()
		.from(candidates)
		.where(eq(candidates.userId, candidateUser.id))
		.limit(1);

	const [candidateRecord] = existingCandidateRecord
		? [existingCandidateRecord]
		: await db
				.insert(candidates)
				.values({
					userId: candidateUser.id,
					fullName: candidateUser.name ?? "",
					position: "",
				})
				.returning();

	if (!candidateRecord) return;

	const timeline = await db
		.select({
			key: hiringSteps.key,
			name: hiringSteps.name,
			description: hiringSteps.description,
			position: hiringSteps.position,
		})
		.from(hiringSteps)
		.orderBy(hiringSteps.position);

	const stepStatuses = await db
		.select({
			stepKey: candidateStepStatus.stepKey,
			status: candidateStepStatus.status,
			note: candidateStepStatus.note,
		})
		.from(candidateStepStatus)
		.where(eq(candidateStepStatus.candidateId, candidateRecord.id));

	const missingFields = {
		proofOfWorkSummary: !hasValue(candidateRecord.proofOfWorkSummary),
		biggestAchievement: !hasValue(candidateRecord.biggestAchievement),
		whySparkmate: !hasValue(candidateRecord.whySparkmate),
	};

	const prompt = buildExistingCandidatePrompt({
		candidateEmail,
		message,
		candidateContext: {
			fullName: candidateRecord.fullName,
			preferredName: candidateRecord.preferredName,
			position: candidateRecord.position,
			proofOfWorkSummary: candidateRecord.proofOfWorkSummary,
			biggestAchievement: candidateRecord.biggestAchievement,
			whySparkmate: candidateRecord.whySparkmate,
			note: candidateRecord.note,
			missingFields,
		},
		hiringContext: { timeline, stepStatuses },
	});

	const parsed = await generateAndParseJson(
		ai,
		prompt,
		EXISTING_CANDIDATE_ANALYSIS_SCHEMA,
	);
	if (!parsed) return;

	await db
		.insert(emails)
		.values({
			candidateId: candidateRecord.id,
			direction: candidateEmail.direction,
			shortSummary: parsed.shortSummary,
			messageId: message.gmailMessageId ?? "",
		})
		.onConflictDoNothing({ target: emails.messageId });

	const candidateSet: Partial<typeof candidates.$inferInsert> = {};
	if (
		missingFields.proofOfWorkSummary &&
		hasValue(parsed.candidateUpdates?.proofOfWorkSummary)
	) {
		candidateSet.proofOfWorkSummary =
			parsed.candidateUpdates?.proofOfWorkSummary?.trim() ?? null;
	}
	if (
		missingFields.biggestAchievement &&
		hasValue(parsed.candidateUpdates?.biggestAchievement)
	) {
		candidateSet.biggestAchievement =
			parsed.candidateUpdates?.biggestAchievement?.trim() ?? null;
	}
	if (missingFields.whySparkmate && hasValue(parsed.candidateUpdates?.whySparkmate)) {
		candidateSet.whySparkmate = parsed.candidateUpdates?.whySparkmate?.trim() ?? null;
	}
	if (hasValue(parsed.candidateUpdates?.note)) {
		candidateSet.note = appendNote(candidateRecord.note, parsed.candidateUpdates?.note);
	}

	if (Object.keys(candidateSet).length > 0) {
		await db
			.update(candidates)
			.set(candidateSet)
			.where(eq(candidates.id, candidateRecord.id));
	}

	if (parsed.stepUpdate) {
		const knownStep = timeline.find((step) => step.key === parsed.stepUpdate?.stepKey);
		if (knownStep) {
			await db
				.insert(candidateStepStatus)
				.values({
					candidateId: candidateRecord.id,
					stepKey: parsed.stepUpdate.stepKey,
					status: parsed.stepUpdate.status,
					note: parsed.stepUpdate.note ?? null,
				})
				.onConflictDoUpdate({
					target: [
						candidateStepStatus.candidateId,
						candidateStepStatus.stepKey,
					],
					set: {
						status: parsed.stepUpdate.status,
						note: parsed.stepUpdate.note ?? null,
					},
				});
		}
	}
}

async function ingestForUnknownCandidate({
	ai,
	candidateEmail,
	message,
}: {
	ai: GoogleGenAI;
	candidateEmail: { email: string; direction: "inbound" | "outbound" };
	message: {
		gmailMessageId: string | null;
		sender: string | null;
		receiver: string | null;
		cc: string | null;
		bcc: string | null;
		body: string | null;
	};
}) {
	const prompt = buildUnknownCandidatePrompt({ candidateEmail, message });
	const parsed = await generateAndParseJson(
		ai,
		prompt,
		UNKNOWN_CANDIDATE_ANALYSIS_SCHEMA,
	);
	if (!parsed || !parsed.isHiringRelated) return;

	const candidateName =
		parsed.candidateDraft?.fullName?.trim() ||
		candidateEmail.email.split("@")[0] ||
		"Candidate";
	const candidatePosition = parsed.candidateDraft?.position?.trim() ?? "";
	const candidateLinks = normalizeLinks(parsed.candidateDraft?.links ?? []);
	const provisionalUserId = `gmail:${candidateEmail.email}`;

	await db
		.insert(user)
		.values({
			id: provisionalUserId,
			name: candidateName,
			email: candidateEmail.email,
			role: "candidate",
			emailVerified: false,
		})
		.onConflictDoNothing({ target: user.email });

	const [candidateUser] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, candidateEmail.email))
		.limit(1);

	if (!candidateUser) return;

	const [candidateRecord] = await db
		.insert(candidates)
		.values({
			userId: candidateUser.id,
			fullName: candidateName,
			preferredName: toNullable(parsed.candidateDraft?.preferredName),
			phone: toNullable(parsed.candidateDraft?.phone),
			currentLocation: toNullable(parsed.candidateDraft?.currentLocation),
			position: candidatePosition,
			links: candidateLinks,
			proofOfWorkSummary: toNullable(parsed.candidateDraft?.proofOfWorkSummary),
			biggestAchievement: toNullable(parsed.candidateDraft?.biggestAchievement),
			whySparkmate: toNullable(parsed.candidateDraft?.whySparkmate),
			note: toNullable(parsed.candidateDraft?.note),
		})
		.onConflictDoUpdate({
			target: candidates.userId,
			set: {
				fullName: candidateName,
				preferredName: toNullable(parsed.candidateDraft?.preferredName),
				phone: toNullable(parsed.candidateDraft?.phone),
				currentLocation: toNullable(parsed.candidateDraft?.currentLocation),
				position: candidatePosition,
				links: candidateLinks,
				proofOfWorkSummary: toNullable(parsed.candidateDraft?.proofOfWorkSummary),
				biggestAchievement: toNullable(parsed.candidateDraft?.biggestAchievement),
				whySparkmate: toNullable(parsed.candidateDraft?.whySparkmate),
				note: toNullable(parsed.candidateDraft?.note),
			},
		})
		.returning();

	if (!candidateRecord || !hasValue(parsed.shortSummary)) return;

	await db
		.insert(emails)
		.values({
			candidateId: candidateRecord.id,
			direction: candidateEmail.direction,
			shortSummary: parsed.shortSummary?.trim() ?? "",
			messageId: message.gmailMessageId ?? "",
		})
		.onConflictDoNothing({ target: emails.messageId });
}
