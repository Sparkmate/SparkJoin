import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { candidateProfiles } from "#/db/schema";
import { protectedProcedure } from "../init";

const optionalUrl = z
	.string()
	.trim()
	.url("Please enter a valid URL")
	.or(z.literal(""))
	.transform((value) => (value.length > 0 ? value : null));

const optionalText = z
	.string()
	.trim()
	.max(5000)
	.or(z.literal(""))
	.transform((value) => (value.length > 0 ? value : null));

const optionalShortText = z
	.string()
	.trim()
	.max(280)
	.or(z.literal(""))
	.transform((value) => (value.length > 0 ? value : null));

const profileInputSchema = z.object({
	fullName: z.string().trim().max(140),
	preferredName: optionalShortText,
	phone: optionalShortText,
	currentLocation: optionalShortText,
	linkedinUrl: optionalUrl,
	githubUrl: optionalUrl,
	portfolioLinks: z.array(z.string().trim().url()).max(20),
	workSampleLinks: z.array(z.string().trim().url()).max(20),
	portfolioDocumentUrls: z.array(z.string().trim().url()).max(40),
	workSampleDocumentUrls: z.array(z.string().trim().url()).max(40),
	proofOfWorkSummary: optionalText,
	biggestAchievement: optionalText,
	whySparkmate: optionalText,
	buildStrengths: z.array(z.string().trim().min(1).max(80)).max(20),
	workAuthorization: optionalShortText,
	earliestStartDate: optionalShortText,
	interviewAvailability: optionalText,
	canAttendHongKongOnsite: z.boolean(),
	additionalContext: optionalText,
});

function normalizeLinks(values: string[]): string[] {
	return Array.from(
		new Set(
			values.map((item) => item.trim()).filter((item) => item.length > 0),
		),
	);
}

function normalizeTags(values: string[]): string[] {
	return Array.from(
		new Set(
			values.map((item) => item.trim()).filter((item) => item.length > 0),
		),
	);
}

function getProfileCompletion(profile: {
	fullName: string;
	phone: string | null;
	currentLocation: string | null;
	workSampleLinks: string[];
	workSampleDocumentUrls: string[];
	proofOfWorkSummary: string | null;
	biggestAchievement: string | null;
	whySparkmate: string | null;
	interviewAvailability: string | null;
}) {
	const checks = [
		profile.fullName.trim().length > 1,
		(profile.phone ?? "").trim().length > 0,
		(profile.currentLocation ?? "").trim().length > 0,
		profile.workSampleDocumentUrls.length > 0 ||
			profile.workSampleLinks.length > 0,
		(profile.proofOfWorkSummary ?? "").trim().length > 30,
		(profile.biggestAchievement ?? "").trim().length > 30,
		(profile.whySparkmate ?? "").trim().length > 30,
		(profile.interviewAvailability ?? "").trim().length > 0,
	];

	const completed = checks.filter(Boolean).length;
	const total = checks.length;

	return {
		completed,
		total,
		percentage: Math.round((completed / total) * 100),
	};
}

export const candidateProfileRouter = {
	getMyProfile: protectedProcedure.query(async ({ ctx }) => {
		const [existing] = await ctx.db
			.select()
			.from(candidateProfiles)
			.where(eq(candidateProfiles.userId, ctx.user.id))
			.limit(1);

		const [record] = existing
			? [existing]
			: await ctx.db
					.insert(candidateProfiles)
					.values({
						userId: ctx.user.id,
						candidateEmail: ctx.user.email,
						fullName: ctx.user.name ?? "",
					})
					.returning();

		return {
			profile: record,
			completion: getProfileCompletion({
				fullName: record.fullName,
				phone: record.phone,
				currentLocation: record.currentLocation,
				workSampleLinks: record.workSampleLinks ?? [],
				workSampleDocumentUrls: record.workSampleDocumentUrls ?? [],
				proofOfWorkSummary: record.proofOfWorkSummary,
				biggestAchievement: record.biggestAchievement,
				whySparkmate: record.whySparkmate,
				interviewAvailability: record.interviewAvailability,
			}),
		};
	}),
	upsertMyProfile: protectedProcedure
		.input(profileInputSchema)
		.mutation(async ({ ctx, input }) => {
			const payload = {
				candidateEmail: ctx.user.email,
				fullName: input.fullName,
				preferredName: input.preferredName,
				phone: input.phone,
				currentLocation: input.currentLocation,
				linkedinUrl: input.linkedinUrl,
				githubUrl: input.githubUrl,
				portfolioLinks: normalizeLinks(input.portfolioLinks),
				workSampleLinks: normalizeLinks(input.workSampleLinks),
				portfolioDocumentUrls: normalizeLinks(input.portfolioDocumentUrls),
				workSampleDocumentUrls: normalizeLinks(input.workSampleDocumentUrls),
				proofOfWorkSummary: input.proofOfWorkSummary,
				biggestAchievement: input.biggestAchievement,
				whySparkmate: input.whySparkmate,
				buildStrengths: normalizeTags(input.buildStrengths),
				workAuthorization: input.workAuthorization,
				earliestStartDate: input.earliestStartDate,
				interviewAvailability: input.interviewAvailability,
				canAttendHongKongOnsite: input.canAttendHongKongOnsite,
				additionalContext: input.additionalContext,
			};

			const fullName = payload.fullName || ctx.user.name || "";

			await ctx.db
				.insert(candidateProfiles)
				.values({
					userId: ctx.user.id,
					...payload,
					fullName,
				})
				.onConflictDoUpdate({
					target: candidateProfiles.userId,
					set: { ...payload, fullName },
				});

			const [updated] = await ctx.db
				.select()
				.from(candidateProfiles)
				.where(eq(candidateProfiles.userId, ctx.user.id))
				.limit(1);

			return {
				profile: updated,
				completion: getProfileCompletion({
					fullName: updated.fullName,
					phone: updated.phone,
					currentLocation: updated.currentLocation,
					workSampleLinks: updated.workSampleLinks ?? [],
					workSampleDocumentUrls: updated.workSampleDocumentUrls ?? [],
					proofOfWorkSummary: updated.proofOfWorkSummary,
					biggestAchievement: updated.biggestAchievement,
					whySparkmate: updated.whySparkmate,
					interviewAvailability: updated.interviewAvailability,
				}),
			};
		}),
} satisfies TRPCRouterRecord;
