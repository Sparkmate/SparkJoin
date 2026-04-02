import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
	asPageByKey,
	type BeltColorToken,
	type BeltDefinition,
	type GuideIntroBlock,
	type GuideRichSegment,
} from "#/config/pages-content";

export const Route = createFileRoute("/_private/guides/belt-system")({
	component: BeltSystem,
	loader: async ({ context }) => {
		const row = await context.queryClient.ensureQueryData(
			context.trpc.pages.get.queryOptions({
				key: "guides::belt-system",
			}),
		);
		if (!row) {
			throw new Error("Missing page content: guides::belt-system");
		}
		return asPageByKey("guides::belt-system", row.value);
	},
});

function beltDotClass(token: BeltColorToken): string {
	switch (token) {
		case "white":
			return "w-6 h-6 rounded-full bg-white border border-brand-dark";
		case "yellow":
			return "w-6 h-6 rounded-full bg-yellow-400 border border-brand-dark";
		case "orange":
			return "w-6 h-6 rounded-full bg-orange-500 border border-brand-dark";
		case "green":
			return "w-6 h-6 rounded-full bg-green-500 border border-brand-dark";
		case "black":
			return "w-6 h-6 rounded-full bg-black border border-brand-dark shadow-[0_0_10px_rgba(255,255,255,0.1)]";
	}
}

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
		return <p>{block}</p>;
	}
	return (
		<p>
			<IntroSegments segments={block.segments} />
		</p>
	);
}

function BeltSection({ belt }: { belt: BeltDefinition }) {
	return (
		<div
			id={belt.anchorId}
			className="border-t border-brand-dark pt-8 flex flex-col md:flex-row gap-8"
		>
			<div className="md:w-1/3 shrink-0">
				<span className="text-brand-accent font-mono text-sm font-bold tracking-widest uppercase block mb-2">
					{belt.index}
				</span>
				<div className="flex items-center gap-4">
					<div className={beltDotClass(belt.colorToken)} />
					<h3 className="text-2xl font-bold text-white tracking-wider">{belt.name}</h3>
				</div>
			</div>
			<div className="md:w-2/3 space-y-4">
				<p className="text-xl font-bold text-white mb-4">{belt.standard}</p>
				{belt.paragraphs.map((p) => (
					<p key={`${belt.anchorId}:${p}`}>{p}</p>
				))}
				{belt.panels.map((panel) => (
					<div
						key={`${belt.anchorId}:${panel.label}:${panel.body}`}
						className={`bg-brand-surface p-4 border border-brand-dark ${panel === belt.panels[0] ? "mt-4" : ""}`}
					>
						<strong className="text-white block mb-1">{panel.label}</strong>
						{panel.body}
					</div>
				))}
				{belt.readyLabel && belt.readyBody ? (
					<p className="pt-2">
						<strong className="text-white">{belt.readyLabel}</strong> {belt.readyBody}
					</p>
				) : null}
			</div>
		</div>
	);
}

function BeltSystem() {
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
				<div className="text-lg md:text-xl text-brand-gray leading-relaxed max-w-3xl space-y-6">
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

			<div className="space-y-12 text-brand-gray leading-relaxed">
				{page.belts.map((belt) => (
					<BeltSection key={belt.anchorId} belt={belt} />
				))}

				<div className="border-t border-brand-dark pt-12">
					<p className="text-lg font-medium text-white max-w-3xl">{page.footer}</p>
				</div>
			</div>
		</div>
	);
}
