import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import z from "zod";
import { user } from "#/db/schema";
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

		const candidates = await ctx.db
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

		return { candidates };
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
