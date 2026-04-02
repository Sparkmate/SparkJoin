import { createFileRoute } from "@tanstack/react-router";
import {
	AlertTriangle,
	CheckCircle2,
	CircleDashed,
	Clock3,
	Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { PageHeader } from "#/components/page-blocks/page-header";

export const Route = createFileRoute("/_private/")({
	loader: async ({ context }) =>
		context.queryClient.ensureQueryData(
			context.trpc.candidate.process.getMyProcess.queryOptions(),
		),
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();
	const currentStep =
		data.timeline.find((step) => step.status === "current") ??
		data.timeline.find((step) => step.status === "rejected");

	return (
		<div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
			<PageHeader
				title="Your Sparkmate Application"
				description={{
					title:
						"See your current stage, what comes next, and how your application is progressing.",
				}}
			/>

			<motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
			>
				<div className="lg:col-span-2 border border-brand-dark bg-brand-surface p-6 md:p-8">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h2 className="mb-2">Current Stage</h2>
							<p className="text-2xl md:text-3xl text-white font-semibold uppercase tracking-tight font-title max-w-none">
								{currentStep?.title ?? "Application Started"}
							</p>
						</div>
						<div className="shrink-0 border border-brand-dark px-3 py-2 bg-brand-bg">
							<span className="text-brand-primary">
								{data.process.outcome === "hired"
									? "Hired"
									: data.process.outcome === "rejected"
										? "Closed"
										: "In Progress"}
							</span>
						</div>
					</div>

					<p className="mt-4">{currentStep?.description}</p>

					<div className="mt-6">
						<div className="flex items-center justify-between mb-2">
							<span className="text-brand-accent">Process Completion</span>
							<span className="text-brand-light">
								{data.completedCount}/{data.totalSteps} steps
							</span>
						</div>
						<div className="h-2 border border-brand-dark bg-brand-bg overflow-hidden">
							<div
								className="h-full bg-brand-primary transition-all duration-300"
								style={{ width: `${data.progressPercentage}%` }}
							/>
						</div>
					</div>
				</div>

				<div className="border border-brand-dark bg-brand-surface p-6 md:p-8">
					<h2 className="mb-4">Your Application Readout</h2>
					<div className="space-y-4">
						<div className="border border-brand-dark bg-brand-bg p-4">
							<h3 className="mb-2">Team Resonance</h3>
							<p className="text-white text-3xl font-semibold font-title max-w-none">
								{data.process.cultureFitScore === null
									? "In review"
									: `${data.process.cultureFitScore}%`}
							</p>
							<p className="mt-2 text-brand-gray text-sm max-w-none normal-case tracking-normal font-sans font-medium">
								A human read of how your work style and mindset align with how
								we build at Sparkmate.
							</p>
						</div>
						<div className="border border-brand-dark bg-brand-bg p-4">
							<h3 className="mb-2">First Interview Partner</h3>
							<p className="text-white max-w-none">
								{data.process.firstInterviewerEmail ??
									"We will assign this soon"}
							</p>
						</div>
					</div>
				</div>
			</motion.section>

			<section className="border border-brand-dark bg-brand-surface p-6 md:p-8">
				<h2 className="mb-6">Application Timeline</h2>
				<div className="space-y-4">
					{data.timeline.map((step, index) => {
						const isLast = index === data.timeline.length - 1;
						const icon =
							step.status === "done" ? (
								<CheckCircle2 className="w-5 h-5 text-emerald-400" />
							) : step.status === "current" ? (
								<Clock3 className="w-5 h-5 text-brand-primary" />
							) : step.status === "rejected" ? (
								<AlertTriangle className="w-5 h-5 text-red-400" />
							) : (
								<CircleDashed className="w-5 h-5 text-brand-gray" />
							);

						return (
							<div key={step.key} className="relative pl-10">
								{!isLast ? (
									<div className="absolute left-[0.62rem] top-7 h-[calc(100%+0.75rem)] w-px bg-brand-dark" />
								) : null}
								<div className="absolute left-0 top-1">{icon}</div>
								<div className="border border-brand-dark bg-brand-bg p-4 md:p-5">
									<div className="flex flex-wrap items-center gap-2 mb-2">
										<span className="text-brand-accent">{`Step ${index + 1}`}</span>
										<span className="text-brand-light">-</span>
										<span className="text-brand-light">{step.owner}</span>
									</div>
									<p className="text-white text-xl font-semibold uppercase tracking-tight font-title max-w-none">
										{step.title}
									</p>
									<p className="mt-2">{step.description}</p>
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
