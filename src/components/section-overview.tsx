import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { navGroups } from "#/config/navigation";
import { PageHeader } from "@/components/page-blocks/page-header";

interface SectionOverviewProps {
  title: string;
  description: string;
}

export function SectionOverview({ title, description }: SectionOverviewProps) {
  const group = navGroups.find((g) => g.title === title);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
      <PageHeader title={title} description={{ title: description }} />

      {group && group.items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {group.items.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={item.path}
                className="block h-full bg-brand-surface border border-brand-dark p-6 md:p-8 hover:border-brand-accent transition-none group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-none bg-brand-gray group-hover:bg-brand-accent transition-none" />

                  <h3 className="text-xl font-bold text-white uppercase tracking-tight font-title group-hover:text-brand-accent transition-none">
                    {item.name}
                  </h3>
                </div>
                <p className="text-brand-gray text-sm font-medium leading-relaxed group-hover:text-brand-light transition-none">
                  Explore {item.name.toLowerCase()} and learn more about our
                  approach.
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
