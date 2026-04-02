import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "#/components/page-blocks/page-header";
import { asPageByKey } from "#/config/pages-content";

export const Route = createFileRoute("/_private/culture/principles")({
  component: Principles,
  loader: async ({ context }) => {
    const page = await context.queryClient.ensureQueryData(
      context.trpc.pages.get.queryOptions({ key: "culture::principles" })
    );

    return asPageByKey("culture::principles", page.value);
  },
});

function Principles() {
  const page = Route.useLoaderData();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
      <PageHeader
        title={page.header.title}
        description={page.header.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-dark">
        {page.principles.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-brand-surface p-8 md:p-12 flex flex-col justify-between group hover:bg-brand-bg transition-none"
          >
            <div>
              <div className="text-brand-accent font-mono text-sm mb-6 opacity-50">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight group-hover:text-brand-accent transition-none font-title">
                {p.title}
              </h3>
              <p className="text-base text-brand-gray leading-relaxed font-medium">
                {p.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
