import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
	asPageByKey,
	type GuideIntroBlock,
	type GuideLabeledBlock,
	type GuideRichSegment,
	type TimeOffPolicySection,
} from "#/config/pages-content";

export const Route = createFileRoute("/_private/guides/time-off-policy")({
	component: TimeOffPolicy,
	loader: async ({ context }) => {
		const row = await context.queryClient.ensureQueryData(
			context.trpc.pages.get.queryOptions({ key: "guides::time-off-policy" }),
		);
		if (!row) {
			throw new Error("Missing page content: guides::time-off-policy");
		}
		return asPageByKey("guides::time-off-policy", row.value);
	},
});

function IntroSegments({ segments }: { segments: GuideRichSegment[] }) {
	return (
		<>
			{segments.map((seg) => {
				const key = `${seg.kind}:${seg.value}`;
				if (seg.kind === "emphasis") {
					return (
						<strong key={key} className="text-white">
							{seg.value}
						</strong>
					);
				}
				return <span key={key}>{seg.value}</span>;
			})}
		</>
	);
}

function IntroBlock({ block }: { block: GuideIntroBlock }) {
	if (typeof block === "string") {
		return <p className="mb-4">{block}</p>;
	}
	return (
		<p className="mb-4">
			<IntroSegments segments={block.segments} />
		</p>
	);
}

function LabeledBlocks({ blocks }: { blocks: GuideLabeledBlock[] }) {
	return (
		<>
			{blocks.map((block) => (
				<div key={block.label}>
					<strong className="text-white block mb-1">{block.label}</strong>
					{block.body}
				</div>
			))}
		</>
	);
}

function TimeOffSectionBlock({ section }: { section: TimeOffPolicySection }) {
	return (
		<div className="border-t border-brand-dark pt-8 flex flex-col md:flex-row gap-8">
			<div className="md:w-1/3 shrink-0">
				<span className="text-brand-accent font-mono text-sm font-bold tracking-widest uppercase">
					{section.index}
				</span>
				<h3 className="text-2xl font-bold text-white uppercase tracking-wider mt-2">
					{section.title}
				</h3>
			</div>
			<div className="md:w-2/3 space-y-6">
				{section.lead ? (
					<p className="text-xl font-medium text-white mb-4">{section.lead}</p>
				) : null}
				{section.paragraphs?.map((p) => (
					<p key={`${section.index}:${p}`}>{p}</p>
				))}
				{section.blocks ? <LabeledBlocks blocks={section.blocks} /> : null}
				{section.callout ? (
					<div className="bg-brand-surface p-6 border-l-4 border-brand-accent">
						<strong className="text-white block mb-2 text-lg">
							{section.callout.title}
						</strong>
						{section.callout.body}
					</div>
				) : null}
				{section.noticeRule ? (
					<div className="bg-brand-surface p-4 border border-brand-dark">
						<strong className="text-white block mb-2">
							{section.noticeRule.title}
						</strong>
						<ul className="list-disc list-inside space-y-1">
							{section.noticeRule.items.map((item) => (
								<li key={`${item.text}:${item.strong}`}>
									{item.text}
									<strong className="text-white">{item.strong}</strong>
								</li>
							))}
						</ul>
					</div>
				) : null}
				{section.blocksTail ? (
					<LabeledBlocks blocks={section.blocksTail} />
				) : null}
			</div>
		</div>
	);
}

function TimeOffPolicy() {
	const page = Route.useLoaderData();

	return (
		<div className="max-w-5xl mx-auto px-4 py-12 md:px-8 md:py-24">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-20"
			>
				<h1 className="text-5xl md:text-7xl font-semibold uppercase tracking-tight mb-6 text-white font-title">
					{page.title}
				</h1>
				<div className="text-lg md:text-xl text-brand-gray leading-relaxed max-w-3xl">
					{page.intro.map((block) => (
						<IntroBlock
							key={
								typeof block === "string"
									? block
									: block.segments.map((s) => `${s.kind}:${s.value}`).join("|")
							}
							block={block}
						/>
					))}
				</div>
			</motion.div>

			<div className="space-y-16 text-brand-gray leading-relaxed">
				{page.sections.map((section) => (
					<TimeOffSectionBlock key={section.index} section={section} />
				))}

				<div className="border-t border-brand-dark pt-12">
					<p className="text-lg font-medium text-white max-w-4xl">{page.footer}</p>
				</div>
			</div>
		</div>
	);
}
