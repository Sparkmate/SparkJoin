import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { db } from "@/db";
import { auth } from "@/lib/auth";

type CreateTRPCContextOptions = {
  headers: Headers;
};

export const createTRPCContext = async ({
  headers,
}: CreateTRPCContextOptions) => {
  const session = await auth.api.getSession({ headers });

  return {
    db,
    headers,
    ...session,
  };
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;

const enforceUserIsAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUserIsAuthenticated);
