import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
	asPageByKey,
	type BarRaiserSection,
	type GuideIntroBlock,
	type GuideRichSegment,
} from "#/config/pages-content";

export const Route = createFileRoute("/_private/guides/bar-raiser-meeting")({
	component: BarRaiserMeeting,
	loader: async ({ context }) => {
		const row = await context.queryClient.ensureQueryData(
			context.trpc.pages.get.queryOptions({
				key: "guides::bar-raiser-meeting",
			}),
		);
		if (!row) {
			throw new Error("Missing page content: guides::bar-raiser-meeting");
		}
		return asPageByKey("guides::bar-raiser-meeting", row.value);
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

function renderLabeledBody(body: string, quote?: string) {
	if (!quote) {
		return body;
	}
	const wrapped = `"${quote}"`;
	const idx = body.indexOf(wrapped);
	if (idx === -1) {
		return body;
	}
	const before = body.slice(0, idx);
	const after = body.slice(idx + wrapped.length);
	return (
		<>
			{before}
			<span className="italic text-white">{wrapped}</span>
			{after}
		</>
	);
}

function BarRaiserSectionBlock({ section }: { section: BarRaiserSection }) {
	return (
		<div className="border-t border-brand-dark pt-8 flex flex-col md:flex-row gap-8">
			<div className="md:w-1/3 shrink-0">
				<span className="text-brand-accent font-mono text-sm font-bold tracking-widest uppercase">
					{section.index}
				</span>
				<h3 className="text-2xl font-bold text-white tracking-wider mt-2">
					{section.title}
				</h3>
			</div>
			<div className="md:w-2/3 space-y-4">
				{section.paragraphs.map((p) => (
					<p key={`${section.index}:${p}`}>{p}</p>
				))}
				{section.callout ? (
					<p className="text-xl font-medium text-white border-l-2 border-brand-accent pl-4 py-2">
						{section.callout}
					</p>
				) : null}
				{section.labeled?.map((block) => (
					<p key={block.label}>
						<strong className="text-white">{block.label}</strong>{" "}
						{section.guaranteeQuote
							? renderLabeledBody(block.body, section.guaranteeQuote)
							: block.body}
					</p>
				))}
				{section.standardLinks && section.standardLinks.length > 0 ? (
					<ul className="space-y-4 mt-4">
						{section.standardLinks.map((item) => (
							<li
								key={item.link.href}
								className="bg-brand-surface p-4 border border-brand-dark"
							>
								{item.prefix}
								<Link
									to={item.link.href}
									className="text-brand-accent hover:underline"
								>
									{item.link.label}
								</Link>
							</li>
						))}
					</ul>
				) : null}
			</div>
		</div>
	);
}

function BarRaiserMeeting() {
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
					<BarRaiserSectionBlock key={section.index} section={section} />
				))}

				<div className="border-t border-brand-dark pt-12">
					<p className="text-lg font-medium text-white max-w-3xl">{page.footer}</p>
				</div>
			</div>
		</div>
	);
}
