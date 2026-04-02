import { createFileRoute } from "@tanstack/react-router";
import { SectionOverview } from "@/components/section-overview";

export const Route = createFileRoute("/_private/guides/")({
  component: () => (
    <SectionOverview
      title="Guides"
      description="Operational manuals and handbooks."
    />
  ),
});
