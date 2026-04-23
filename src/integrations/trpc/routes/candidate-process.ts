import type { TRPCRouterRecord } from "@trpc/server";
import { asc } from "drizzle-orm";
import { hiringSteps } from "#/db/schema";
import { protectedProcedure } from "../init";

export const candidateProcessRouter = {
	list: protectedProcedure.query(async ({ ctx }) => {
		const timeline = await ctx.db
			.select({
				id: hiringSteps.id,
				key: hiringSteps.key,
				name: hiringSteps.name,
				position: hiringSteps.position,
				isTerminal: hiringSteps.isTerminal,
				description: hiringSteps.description,
			})
			.from(hiringSteps)
			.orderBy(asc(hiringSteps.position));

		return { timeline };
	}),
} satisfies TRPCRouterRecord;
