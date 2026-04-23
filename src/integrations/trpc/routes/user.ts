import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { asc, desc, eq, inArray } from "drizzle-orm";
import z from "zod";
import {
	candidateStepStatus,
	candidates,
	emails,
	hiringSteps,
	user,
} from "#/db/schema";
import { protectedProcedure } from "../init";

export const userRouter = {
	listCandidates: protectedProcedure.query(async ({ ctx }) => {
		const [actor] = await ctx.db
			.select({ role: user.role })
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(1);

		if (!actor || actor.role !== "admin") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Admin access required",
			});
		}

		const candidateUsers = await ctx.db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				banned: user.banned,
				banReason: user.banReason,
				createdAt: user.createdAt,
			})
			.from(user)
			.where(eq(user.role, "candidate"))
			.orderBy(desc(user.createdAt));

		const userIds = candidateUsers.map((candidate) => candidate.id);

		if (userIds.length === 0) {
			return { candidates: [] };
		}

		const candidateProfiles = await ctx.db
			.select({
				id: candidates.id,
				userId: candidates.userId,
				fullName: candidates.fullName,
				preferredName: candidates.preferredName,
				phone: candidates.phone,
				currentLocation: candidates.currentLocation,
				position: candidates.position,
				links: candidates.links,
				proofOfWorkSummary: candidates.proofOfWorkSummary,
				biggestAchievement: candidates.biggestAchievement,
				whySparkmate: candidates.whySparkmate,
				note: candidates.note,
				createdAt: candidates.createdAt,
				updatedAt: candidates.updatedAt,
			})
			.from(candidates)
			.where(inArray(candidates.userId, userIds));

		const candidateProfileByUserId = new Map(
			candidateProfiles.map((profile) => [profile.userId, profile]),
		);
		const profileIds = candidateProfiles.map((profile) => profile.id);

		const candidateEmails = profileIds.length
			? await ctx.db
					.select({
						id: emails.id,
						candidateId: emails.candidateId,
						direction: emails.direction,
						shortSummary: emails.shortSummary,
						messageId: emails.messageId,
						createdAt: emails.createdAt,
						updatedAt: emails.updatedAt,
					})
					.from(emails)
					.where(inArray(emails.candidateId, profileIds))
					.orderBy(desc(emails.createdAt))
			: [];

		const allHiringSteps = await ctx.db
			.select({
				key: hiringSteps.key,
				name: hiringSteps.name,
				description: hiringSteps.description,
				position: hiringSteps.position,
				isTerminal: hiringSteps.isTerminal,
			})
			.from(hiringSteps)
			.orderBy(asc(hiringSteps.position));

		const statuses = profileIds.length
			? await ctx.db
					.select({
						candidateId: candidateStepStatus.candidateId,
						stepKey: candidateStepStatus.stepKey,
						status: candidateStepStatus.status,
						note: candidateStepStatus.note,
						updatedAt: candidateStepStatus.updatedAt,
					})
					.from(candidateStepStatus)
					.where(inArray(candidateStepStatus.candidateId, profileIds))
			: [];

		const emailsByCandidateId = new Map<number, (typeof candidateEmails)[number][]>();
		for (const email of candidateEmails) {
			const existing = emailsByCandidateId.get(email.candidateId) ?? [];
			existing.push(email);
			emailsByCandidateId.set(email.candidateId, existing);
		}

		const statusByCandidateAndStep = new Map<string, (typeof statuses)[number]>();
		for (const status of statuses) {
			statusByCandidateAndStep.set(
				`${status.candidateId}:${status.stepKey}`,
				status,
			);
		}

		const enrichedCandidates = candidateUsers.map((candidate) => {
			const profile = candidateProfileByUserId.get(candidate.id) ?? null;
			const emailInteractions = profile
				? emailsByCandidateId.get(profile.id) ?? []
				: [];
			const hiringProgress = profile
				? allHiringSteps.map((step) => {
						const currentStatus = statusByCandidateAndStep.get(
							`${profile.id}:${step.key}`,
						);

						return {
							stepKey: step.key,
							name: step.name,
							description: step.description,
							position: step.position,
							isTerminal: step.isTerminal,
							status: currentStatus?.status ?? "pending",
							note: currentStatus?.note ?? null,
							updatedAt: currentStatus?.updatedAt ?? null,
						};
					})
				: [];

			return {
				...candidate,
				profile,
				emailInteractions,
				hiringProgress,
			};
		});

		return { candidates: enrichedCandidates };
	}),
	banCandidate: protectedProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				reason: z.enum(["rejected", "other"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [actor] = await ctx.db
				.select({ role: user.role })
				.from(user)
				.where(eq(user.id, ctx.user.id))
				.limit(1);

			if (!actor || actor.role !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Admin access required",
				});
			}

			const [targetUser] = await ctx.db
				.select({ id: user.id, role: user.role })
				.from(user)
				.where(eq(user.id, input.userId))
				.limit(1);

			if (!targetUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			if (targetUser.role !== "candidate") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only candidate users can be banned",
				});
			}

			await ctx.db
				.update(user)
				.set({
					banned: true,
					banReason: input.reason,
				})
				.where(eq(user.id, input.userId));

			return { success: true };
		}),
	getRole: protectedProcedure.query(async ({ ctx }) => {
		const [currentUser] = await ctx.db
			.select({ role: user.role })
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(1);

		if (!currentUser) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}

		return { role: currentUser.role };
	}),
	getReadPages: protectedProcedure.query(async ({ ctx }) => {
		const [currentUser] = await ctx.db
			.select({ pagesRead: user.pagesRead })
			.from(user)
			.where(eq(user.id, ctx.user.id))
			.limit(1);

		if (!currentUser) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}

		return { pagesRead: currentUser.pagesRead ?? [] };
	}),
	togglePageRead: protectedProcedure
		.input(
			z.object({
				pageId: z.string().min(1),
				read: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [currentUser] = await ctx.db
				.select()
				.from(user)
				.where(eq(user.id, ctx.user.id))
				.limit(1);

			if (!currentUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			const existingPages = currentUser.pagesRead ?? [];
			const pagesRead = input.read
				? Array.from(new Set([...existingPages, input.pageId]))
				: existingPages.filter((pageId) => pageId !== input.pageId);

			await ctx.db
				.update(user)
				.set({ pagesRead })
				.where(eq(user.id, ctx.user.id));

			return { pagesRead };
		}),
} satisfies TRPCRouterRecord;
