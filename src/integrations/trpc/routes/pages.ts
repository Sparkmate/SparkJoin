import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { pageContentKeys } from "#/config/pages-content";
import { db } from "#/db";
import { pages } from "#/db/schema";
import { protectedProcedure } from "../init";

export const pagesRouter = {
  get: protectedProcedure
    .input(z.object({ key: z.enum(pageContentKeys) }))
    .query(async ({ input }) => {
      const [page] = await db
        .select()
        .from(pages)
        .where(eq(pages.key, input.key))
        .limit(1);

      return page ?? null;
    }),
} satisfies TRPCRouterRecord;
