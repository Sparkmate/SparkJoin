import { createFileRoute } from "@tanstack/react-router";
import { SectionOverview } from "@/components/section-overview";

export const Route = createFileRoute("/_private/culture/")({
  component: () => (
    <SectionOverview
      title="Culture"
      description="The core tenets that drive our existence and ambition."
    />
  ),
});
