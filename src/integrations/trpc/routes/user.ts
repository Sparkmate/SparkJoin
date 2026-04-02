import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { user } from "#/db/auth-schema";
import { protectedProcedure } from "../init";

export const userRouter = {
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
      })
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
