import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader } from "#/components/page-blocks/page-header";
import { useTRPC } from "#/integrations/trpc/react";

export const Route = createFileRoute("/_private/")({
	loader: async ({ context }) =>
		context.queryClient.ensureQueryData(
			context.trpc.candidate.process.list.queryOptions(),
		),
	component: RouteComponent,
});

function RouteComponent() {
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.candidate.process.list.queryOptions());
	console.log(data);

	return (
		<div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
			<PageHeader
				title="Sparkmate Hiring Journey"
				description={{
					title:
						"An overview of the full hiring process, shared for clarity on each step.",
				}}
			/>

			<section className="border border-brand-dark bg-brand-surface p-6 md:p-8">
				<h2 className="mb-6">Application Timeline</h2>
				<div className="space-y-4">
					{data.timeline.map((step, index) => {
						const isLast = index === data.timeline.length - 1;

						return (
							<div key={step.key} className="relative pl-10">
								{!isLast ? (
									<div className="absolute left-[0.62rem] top-7 h-[calc(100%+0.75rem)] w-px bg-brand-dark" />
								) : null}
								<div className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-brand-dark bg-brand-bg text-[10px] text-brand-accent font-mono">
									{index + 1}
								</div>
								<div className="border border-brand-dark bg-brand-bg p-4 md:p-5">
									<div className="flex flex-wrap items-center gap-2 mb-2">
										<span className="text-brand-accent">{`Step ${index + 1}`}</span>
										<span className="text-brand-light">-</span>
										<span className="text-brand-light capitalize">
											{step.name}
										</span>
									</div>
									<p className="mt-2 text-brand-light">{step.description}</p>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			<section className="mt-8 border border-brand-dark bg-brand-surface p-6 md:p-8">
				<div className="flex items-start gap-3 mb-4">
					<Sparkles className="w-5 h-5 text-brand-primary mt-1 shrink-0" />
					<h2 className="mb-0">What to expect from us</h2>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div className="border border-brand-dark bg-brand-bg p-4">
						<h3 className="mb-2 text-brand-light">
							If we pause your application
						</h3>
						<p>
							You receive a clear and respectful response. We encourage strong
							builders to apply again when timing is better.
						</p>
					</div>
					<div className="border border-brand-dark bg-brand-bg p-4">
						<h3 className="mb-2 text-brand-light">If you advance</h3>
						<p>
							We handle interview scheduling with you, create the Google Meet
							calls, and coordinate the onsite day when you reach that stage.
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
