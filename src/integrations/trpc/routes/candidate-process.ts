import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import {
	type CandidateProcessOutcome,
	type CandidateProcessStageKey,
	candidateProcessOutcomes,
	candidateProcessStageKeys,
	candidateProcessStages,
} from "#/config/candidate-process";
import { candidateProcesses } from "#/db/schema";
import { protectedProcedure } from "../init";

type TimelineStatus = "done" | "current" | "upcoming" | "rejected";

function getStageIndex(stageKey: CandidateProcessStageKey): number {
	return candidateProcessStageKeys.indexOf(stageKey);
}

function normalizeStageKey(stageKey: string): CandidateProcessStageKey {
	const isKnownStage = candidateProcessStageKeys.includes(
		stageKey as CandidateProcessStageKey,
	);
	return isKnownStage
		? (stageKey as CandidateProcessStageKey)
		: candidateProcessStageKeys[0];
}

function normalizeOutcome(outcome: string): CandidateProcessOutcome {
	const isKnownOutcome = candidateProcessOutcomes.includes(
		outcome as CandidateProcessOutcome,
	);
	return isKnownOutcome ? (outcome as CandidateProcessOutcome) : "in_progress";
}

export const candidateProcessRouter = {
	getMyProcess: protectedProcedure.query(async ({ ctx }) => {
		const [existing] = await ctx.db
			.select()
			.from(candidateProcesses)
			.where(eq(candidateProcesses.userId, ctx.user.id))
			.limit(1);

		const [record] = existing
			? [existing]
			: await ctx.db
					.insert(candidateProcesses)
					.values({
						userId: ctx.user.id,
						candidateEmail: ctx.user.email,
					})
					.returning();

		const currentStageKey = normalizeStageKey(record.currentStageKey);
		const outcome = normalizeOutcome(record.outcome);
		const currentStageIndex = getStageIndex(currentStageKey);
		const completedStageKeys = new Set(
			(record.completedStageKeys ?? []).filter(
				(key): key is CandidateProcessStageKey =>
					candidateProcessStageKeys.includes(key as CandidateProcessStageKey),
			),
		);

		const timeline = candidateProcessStages.map((stage, index) => {
			let status: TimelineStatus = "upcoming";

			if (outcome === "rejected") {
				if (index < currentStageIndex || completedStageKeys.has(stage.key)) {
					status = "done";
				} else if (index === currentStageIndex) {
					status = "rejected";
				}
			} else if (
				index < currentStageIndex ||
				completedStageKeys.has(stage.key)
			) {
				status = "done";
			} else if (index === currentStageIndex) {
				status = "current";
			}

			return {
				...stage,
				status,
			};
		});

		const completedCount = timeline.filter(
			(step) => step.status === "done",
		).length;
		const progressPercentage =
			outcome === "hired"
				? 100
				: Math.round((completedCount / candidateProcessStages.length) * 100);

		return {
			process: {
				id: record.id,
				candidateEmail: record.candidateEmail,
				currentStageKey,
				outcome,
				cultureFitScore: record.cultureFitScore,
				firstInterviewerEmail: record.firstInterviewerEmail,
				rejectionFeedback: record.rejectionFeedback,
				createdAt: record.createdAt,
				updatedAt: record.updatedAt,
			},
			timeline,
			progressPercentage,
			completedCount,
			totalSteps: candidateProcessStages.length,
		};
	}),
} satisfies TRPCRouterRecord;
