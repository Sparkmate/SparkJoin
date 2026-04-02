import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "#/components/page-blocks/page-header";
import { asPageByKey } from "#/config/pages-content";

export const Route = createFileRoute("/_private/culture/master-plan")({
  component: MasterPlan,
  loader: async ({ context }) => {
    const page = await context.queryClient.ensureQueryData(
      context.trpc.pages.get.queryOptions({ key: "culture::masterplan" })
    );

    return asPageByKey("culture::masterplan", page.value);
  },
});

function MasterPlan() {
  const page = Route.useLoaderData();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
      <PageHeader
        title={page.header.title}
        description={page.header.description}
      />

      <div className="grid grid-cols-1 gap-px bg-brand-dark mb-32">
        <div className="bg-brand-surface p-8 md:p-16 lg:p-24 border border-brand-dark">
          <div className="max-w-4xl space-y-12">
            <div className="space-y-8 text-lg md:text-xl text-brand-gray leading-relaxed font-medium">
              {page.intro.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-px bg-brand-dark">
        {page.stages.map((stage, index) => (
          <motion.div
            key={`${stage.stage}-${stage.title}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`bg-brand-surface p-8 md:p-12 lg:p-16 flex flex-col md:flex-row gap-8 md:gap-16 border-b border-brand-dark ${stage.completed ? "opacity-50" : ""}`}
          >
            <div className="md:w-1/3 shrink-0">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-brand-accent font-mono text-sm uppercase tracking-widest">
                  {stage.stage}
                </span>
                {stage.status && (
                  <span className="text-xs font-mono uppercase tracking-wider px-2 py-1 border border-brand-dark text-brand-gray">
                    {stage.status}
                  </span>
                )}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-2 font-title">
                {stage.title}
              </h3>
              <p className="text-brand-gray font-mono text-sm uppercase tracking-wider">
                {stage.capacity}
              </p>
            </div>

            <div className="md:w-2/3 space-y-8">
              {stage.goal && (
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider mb-2 text-sm font-title">
                    The Goal
                  </h4>
                  <p className="text-brand-gray leading-relaxed font-medium">
                    {stage.goal}
                  </p>
                </div>
              )}
              {stage.target && (
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider mb-2 text-sm font-title">
                    The Commercial Target
                  </h4>
                  <p className="text-brand-gray leading-relaxed font-medium">
                    {stage.target}
                  </p>
                </div>
              )}
              <div>
                <h4 className="text-white font-bold uppercase tracking-wider mb-2 text-sm font-title">
                  The Reality
                </h4>
                <p className="text-brand-light leading-relaxed font-medium">
                  {stage.reality}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
