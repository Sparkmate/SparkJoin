import { createFileRoute } from "@tanstack/react-router";
import { SectionOverview } from "@/components/section-overview";

export const Route = createFileRoute("/_private/admin/")({
	component: () => (
		<SectionOverview
			title="Admin"
			description="Admin tools for candidate operations and account actions."
		/>
	),
});
