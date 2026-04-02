import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { configContentKeys } from "#/config/config-content";
import { db } from "#/db";
import { config } from "#/db/schema";
import { protectedProcedure } from "../init";

export const configRouter = {
  get: protectedProcedure
    .input(z.object({ key: z.enum(configContentKeys) }))
    .query(async ({ input }) => {
      const [conf] = await db
        .select()
        .from(config)
        .where(eq(config.key, input.key))
        .limit(1);

      return conf ?? null;
    }),
} satisfies TRPCRouterRecord;
