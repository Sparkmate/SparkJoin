import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "#/components/page-blocks/page-header";
import { asPageByKey } from "#/config/pages-content";

export const Route = createFileRoute("/_private/culture/formulas")({
  component: Formulas,
  loader: async ({ context }) => {
    const page = await context.queryClient.ensureQueryData(
      context.trpc.pages.get.queryOptions({ key: "culture::formulas" })
    );

    return asPageByKey("culture::formulas", page.value);
  },
});

function Formulas() {
  const page = Route.useLoaderData();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
      <PageHeader
        title={page.header.title}
        description={page.header.description}
      />

      <div className="space-y-4">
        {page.formulas.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-8 md:p-12 bg-brand-surface border border-brand-dark hover:border-brand-accent transition-none"
          >
            <div className="text-2xl md:text-4xl lg:text-5xl font-mono font-bold tracking-tighter text-white break-words">
              {item.name}{" "}
              <span className="text-brand-gray mx-2 md:mx-4">=</span>{" "}
              {item.formula}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
