import { createFileRoute } from "@tanstack/react-router";
import { SectionOverview } from "@/components/section-overview";

export const Route = createFileRoute("/_private/incentive/")({
  component: () => (
    <SectionOverview
      title="Incentive"
      description="How we reward and align our team."
    />
  ),
});
