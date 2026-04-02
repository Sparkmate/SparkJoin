import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "#/components/page-blocks/page-header";
import { asPageByKey } from "#/config/pages-content";

export const Route = createFileRoute("/_private/culture/readings")({
  component: Readings,
  loader: async ({ context }) => {
    const page = await context.queryClient.ensureQueryData(
      context.trpc.pages.get.queryOptions({ key: "culture::readings" })
    );

    return asPageByKey("culture::readings", page.value);
  },
});

function Readings() {
  const page = Route.useLoaderData();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
      <PageHeader
        title={page.header.title}
        description={page.header.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {page.readings.map((book, i) => (
          <motion.div
            key={`${book.title}-${book.author}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col bg-brand-surface border border-brand-dark p-8 md:p-12 hover:border-brand-accent transition-none"
          >
            <div className="flex justify-between items-start mb-8">
              <span className="text-brand-gray font-mono text-sm uppercase tracking-widest">
                VOL. {String(i + 1).padStart(2, "0")}
              </span>
              {book.available && (
                <span className="text-brand-accent font-mono text-xs uppercase tracking-widest border border-brand-accent px-2 py-1">
                  HQ LIBRARY
                </span>
              )}
            </div>

            <div className="mb-8 flex-1">
              <h3 className="text-3xl font-bold uppercase tracking-tight text-white mb-2 font-title">
                {book.title}
              </h3>
              <p className="text-brand-accent font-mono text-sm uppercase tracking-widest mb-6">
                BY {book.author}
              </p>
              <p className="text-lg text-brand-gray leading-relaxed">
                {book.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
