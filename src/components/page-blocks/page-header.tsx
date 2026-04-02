import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  description,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  description?: {
    title?: string;
    content?: string;
  };
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("mb-16 md:mb-24", className)}
    >
      <div>
        {title && <h1 className="mb-2">{title}</h1>}
        {subtitle && <h3 className="mb-6">{subtitle}</h3>}
        {description?.title && <h2 className="mb-4">{description?.title}</h2>}
        {description?.content && <p className="mt-2">{description?.content}</p>}
      </div>
      {children}
    </motion.div>
  );
}
