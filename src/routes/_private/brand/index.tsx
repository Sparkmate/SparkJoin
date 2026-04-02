import { createFileRoute } from "@tanstack/react-router";
import { SectionOverview } from "@/components/section-overview";

export const Route = createFileRoute("/_private/brand/")({
  component: () => (
    <SectionOverview
      title="Brand"
      description="The visual language and assets of Sparkmate."
    />
  ),
});
