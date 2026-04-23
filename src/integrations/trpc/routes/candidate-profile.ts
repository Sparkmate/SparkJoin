import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { candidates } from "#/db/schema";
import { protectedProcedure } from "../init";

const optionalText = z
  .string()
  .trim()
  .max(20000)
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
  position: z.string().trim().max(140),
  preferredName: optionalShortText,
  phone: optionalShortText,
  currentLocation: optionalShortText,
  links: z.array(z.string().trim().min(1).max(2000)).max(40),
  proofOfWorkSummary: optionalText,
  biggestAchievement: optionalText,
  whySparkmate: optionalText,
  note: optionalText,
});

function normalizeLinks(values: string[]): string[] {
  return Array.from(
    new Set(values.map((item) => item.trim()).filter((item) => item.length > 0))
  );
}

function getProfileCompletion(profile: {
  fullName: string;
  position: string;
  phone: string | null;
  currentLocation: string | null;
  links: string[];
  proofOfWorkSummary: string | null;
  biggestAchievement: string | null;
  whySparkmate: string | null;
}) {
  const checks = [
    profile.fullName.trim().length > 1,
    profile.position.trim().length > 1,
    (profile.phone ?? "").trim().length > 0,
    (profile.currentLocation ?? "").trim().length > 0,
    profile.links.length > 0,
    (profile.proofOfWorkSummary ?? "").trim().length > 30,
    (profile.biggestAchievement ?? "").trim().length > 30,
    (profile.whySparkmate ?? "").trim().length > 30,
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
      .from(candidates)
      .where(eq(candidates.userId, ctx.user.id))
      .limit(1);

    const [record] = existing
      ? [existing]
      : await ctx.db
          .insert(candidates)
          .values({
            userId: ctx.user.id,
            fullName: ctx.user.name ?? "",
            position: "",
          })
          .returning();

    return {
      profile: record,
      completion: getProfileCompletion({
        fullName: record.fullName,
        position: record.position,
        phone: record.phone,
        currentLocation: record.currentLocation,
        links: record.links ?? [],
        proofOfWorkSummary: record.proofOfWorkSummary,
        biggestAchievement: record.biggestAchievement,
        whySparkmate: record.whySparkmate,
      }),
    };
  }),
  upsertMyProfile: protectedProcedure
    .input(profileInputSchema)
    .mutation(async ({ ctx, input }) => {
      const payload = {
        fullName: input.fullName,
        position: input.position,
        preferredName: input.preferredName,
        phone: input.phone,
        currentLocation: input.currentLocation,
        links: normalizeLinks(input.links),
        proofOfWorkSummary: input.proofOfWorkSummary,
        biggestAchievement: input.biggestAchievement,
        whySparkmate: input.whySparkmate,
        note: input.note,
      };

      const fullName = payload.fullName || ctx.user.name || "";

      await ctx.db
        .insert(candidates)
        .values({
          userId: ctx.user.id,
          ...payload,
          fullName,
        })
        .onConflictDoUpdate({
          target: candidates.userId,
          set: { ...payload, fullName },
        });

      const [updated] = await ctx.db
        .select()
        .from(candidates)
        .where(eq(candidates.userId, ctx.user.id))
        .limit(1);

      return {
        profile: updated,
        completion: getProfileCompletion({
          fullName: updated.fullName,
          position: updated.position,
          phone: updated.phone,
          currentLocation: updated.currentLocation,
          links: updated.links ?? [],
          proofOfWorkSummary: updated.proofOfWorkSummary,
          biggestAchievement: updated.biggestAchievement,
          whySparkmate: updated.whySparkmate,
        }),
      };
    }),
} satisfies TRPCRouterRecord;
