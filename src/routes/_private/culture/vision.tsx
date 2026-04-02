import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "#/components/page-blocks/page-header";
import { asPageByKey } from "#/config/pages-content";

export const Route = createFileRoute("/_private/culture/vision")({
  component: Vision,
  loader: async ({ context }) => {
    const page = await context.queryClient.ensureQueryData(
      context.trpc.pages.get.queryOptions({ key: "culture::vision" })
    );

    return asPageByKey("culture::vision", page.value);
  },
});

function Vision() {
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
            <p className="text-2xl md:text-4xl text-white font-bold leading-tight uppercase tracking-tight font-title">
              {page.intro.title}
            </p>
            <div className="space-y-8 text-lg md:text-xl text-brand-gray leading-relaxed font-medium">
              {page.intro.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 md:mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-semibold uppercase tracking-tight mb-2 text-white font-title">
          {page.conviction.title}
        </h1>
        <p className="text-lg md:text-xl text-brand-accent font-medium uppercase tracking-wider mb-4">
          {page.conviction.label}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-px bg-brand-dark mb-32">
        <div className="bg-brand-surface p-8 md:p-16 lg:p-24 border border-brand-dark">
          <div className="max-w-4xl space-y-12">
            <p className="text-2xl md:text-4xl text-white font-bold leading-tight uppercase tracking-tight font-title">
              {page.conviction.statement}
            </p>
            <div className="space-y-8 text-lg md:text-xl text-brand-gray leading-relaxed font-medium">
              {page.conviction.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 md:mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-semibold uppercase tracking-tight mb-2 text-white font-title">
          {page.mission.title}
        </h1>
        <p className="text-lg md:text-xl text-brand-accent font-medium uppercase tracking-wider mb-4">
          {page.mission.label}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-px bg-brand-dark">
        <div className="bg-brand-surface p-8 md:p-16 lg:p-24 border border-brand-dark">
          <div className="max-w-4xl space-y-12">
            <p className="text-2xl md:text-4xl text-white font-bold leading-tight uppercase tracking-tight font-title">
              {page.mission.statement}
            </p>
            <div className="space-y-8 text-lg md:text-xl text-brand-gray leading-relaxed font-medium">
              {page.mission.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
