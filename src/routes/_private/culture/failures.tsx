import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader } from "#/components/page-blocks/page-header";
import { asPageByKey } from "#/config/pages-content";

export const Route = createFileRoute("/_private/culture/failures")({
  component: Failures,
  loader: async ({ context }) => {
    const page = await context.queryClient.ensureQueryData(
      context.trpc.pages.get.queryOptions({ key: "culture::failures" })
    );

    return asPageByKey("culture::failures", page.value);
  },
});

function Failures() {
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
              <p className="text-white">{page.intro.footer}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-px bg-brand-dark">
        {page.failures.map((failure, i) => (
          <motion.div
            key={`${failure.title}-${failure.betrayal}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-brand-surface p-8 md:p-12 lg:p-16 flex flex-col md:flex-row gap-8 md:gap-16 border-b border-brand-dark"
          >
            <div className="md:w-1/3 shrink-0">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-brand-accent font-mono text-sm uppercase tracking-widest">
                  Failure {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4 font-title">
                {failure.title}
              </h3>
              <p className="text-brand-accent font-mono text-sm uppercase tracking-wider">
                {failure.betrayal}
              </p>
            </div>

            <div className="md:w-2/3 space-y-8">
              <div>
                <h4 className="text-white font-bold uppercase tracking-wider mb-2 text-sm font-title">
                  What Happened
                </h4>
                <p className="text-brand-gray leading-relaxed font-medium">
                  {failure.happened}
                </p>
              </div>
              <div>
                <h4 className="text-brand-accent font-bold uppercase tracking-wider mb-2 text-sm font-title">
                  The Lesson
                </h4>
                <p className="text-brand-light leading-relaxed font-medium">
                  {failure.lesson}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
