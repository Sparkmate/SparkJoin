import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { asPageByKey } from "#/config/pages-content";

export const Route = createFileRoute("/_private/guides/remote-policy")({
  component: RemotePolicy,
  loader: async ({ context }) => {
    const row = await context.queryClient.ensureQueryData(
      context.trpc.pages.get.queryOptions({
        key: "guides::remote-policy",
      })
    );
    if (!row) {
      throw new Error("Missing page content: guides::remote-policy");
    }
    return asPageByKey("guides::remote-policy", row.value);
  },
});

function RemotePolicy() {
  const page = Route.useLoaderData();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:px-8 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-20"
      >
        <h1 className="text-5xl md:text-7xl font-semibold uppercase tracking-tight mb-6 text-white font-title">
          {page.title}
        </h1>
        <div className="mt-16 max-w-4xl relative">
          <div className="absolute -top-10 -left-6 text-brand-dark/20 text-9xl font-serif select-none">
            {'"'}
          </div>
          <p className="text-4xl md:text-6xl font-serif text-white leading-tight mb-6 tracking-tight relative z-10">
            {page.hero.line1}
          </p>
          <p className="text-3xl md:text-5xl text-brand-accent font-serif font-light italic relative z-10 pl-8 md:pl-16">
            {page.hero.line2}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
