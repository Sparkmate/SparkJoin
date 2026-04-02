import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { getSession } from "@/lib/auth.functions";

export const Route = createFileRoute("/_public")({
  validateSearch: z.object({
    redirect: z.string().default("/"),
  }),
  beforeLoad: async ({ search: { redirect: redirectTo }, location }) => {
    const session = await getSession();

    if (session) {
      // Allow authenticated users to view the deck page
      if (["/login"].includes(location.pathname)) {
        throw redirect({ to: redirectTo });
      }
      return { user: session.user };
    }

    return { user: null };
  },
  component: Outlet,
});
