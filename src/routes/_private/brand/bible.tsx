import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "#/components/page-blocks/page-header";
import { asPageByKey } from "#/config/pages-content";
import { useState } from "react";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_private/brand/bible")({
	component: BrandBible,
	loader: async ({ context }) => {
		const row = await context.queryClient.ensureQueryData(
			context.trpc.pages.get.queryOptions({ key: "brand::bible" }),
		);
		if (!row) {
			throw new Error("Missing page content: brand::bible");
		}
		return asPageByKey("brand::bible", row.value);
	},
});

const ColorBlock = ({
	name,
	hex,
	desc,
	border = "border-brand-dark",
}: {
	name: string;
	hex: string;
	desc: string;
	border?: string;
}) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(hex);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			className={`w-full text-left border ${border} p-6 flex flex-col justify-between group cursor-pointer hover:border-brand-accent transition-none bg-brand-surface`}
			onClick={handleCopy}
		>
			<div className="space-y-4">
				<div
					className="h-20 w-full border border-brand-dark relative"
					style={{ backgroundColor: hex }}
				>
					{copied && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-xs font-bold uppercase tracking-widest">
							<Check className="w-4 h-4 mr-2" /> Copied
						</div>
					)}
				</div>
				<div>
					<div className="flex justify-between items-center mb-3">
						<h4 className="text-white font-bold uppercase tracking-tight">
							{name}
						</h4>
						<span className="text-xs font-mono text-brand-gray group-hover:text-brand-accent transition-none">
							{hex}
						</span>
					</div>
					<p className="text-sm text-brand-gray leading-relaxed">{desc}</p>
				</div>
			</div>
		</button>
	);
};

function typographySampleClassName(styleName: string): string {
	if (styleName.includes("Hammer")) {
		return "text-3xl md:text-4xl font-bold uppercase tracking-tight text-white font-title";
	}
	if (styleName.includes("Scalpel")) {
		return "text-xs font-bold uppercase tracking-widest text-brand-gray font-mono";
	}
	return "text-sm text-brand-gray leading-relaxed";
}

function BrandBible() {
	const page = Route.useLoaderData();

	return (
		<div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
			<PageHeader
				title={page.header.title}
				description={page.header.description}
				className="flex flex-col md:flex-row md:items-start justify-between gap-8"
			>
				<div className="text-brand-gray text-xs font-bold uppercase tracking-widest font-mono md:text-right shrink-0 mt-2 md:mt-0">
					{page.docRef}
				</div>
			</PageHeader>

			<div className="space-y-16 md:space-y-24">
				<section className="relative">
					<div className="absolute -top-6 right-0 text-brand-gray text-[10px] font-bold uppercase tracking-widest font-mono">
						{page.northStar.id}
					</div>
					<h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-8 border-b border-brand-dark pb-4 font-title">
						{page.northStar.title}
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-brand-dark border border-brand-dark">
						<div className="bg-brand-surface p-8 md:p-12">
							<h3 className="text-sm text-brand-accent uppercase tracking-widest font-mono mb-6">
								{page.northStar.mission.label}
							</h3>
							<p className="text-xl text-white font-medium leading-relaxed">
								{page.northStar.mission.body}
							</p>
						</div>
						<div className="bg-brand-surface p-8 md:p-12">
							<h3 className="text-sm text-brand-accent uppercase tracking-widest font-mono mb-6">
								{page.northStar.execution.label}
							</h3>
							<p className="text-xl text-white font-medium leading-relaxed">
								{page.northStar.execution.body}
							</p>
						</div>
					</div>
				</section>

				<section className="relative">
					<div className="absolute -top-6 right-0 text-brand-gray text-[10px] font-bold uppercase tracking-widest font-mono">
						{page.logos.id}
					</div>
					<h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-8 border-b border-brand-dark pb-4 font-title">
						{page.logos.title}
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-brand-dark border border-brand-dark mb-8">
						<div className="bg-brand-surface p-8 md:p-12 space-y-6">
							<h3 className="text-2xl text-white font-bold uppercase tracking-tight">
								{page.logos.primaryLogo.subtitle}
							</h3>
							<div className="bg-brand-bg p-8 border border-brand-dark flex items-center justify-center min-h-[160px]">
								<img
									src={page.logos.primaryLogo.imageUrl}
									alt={page.logos.primaryLogo.imageAlt}
									className="h-12 w-auto"
									style={{ filter: "brightness(0) invert(0.85)" }}
									referrerPolicy="no-referrer"
								/>
							</div>
							<div className="space-y-4 text-brand-gray">
								{page.logos.primaryLogo.paragraphs.map((p) => (
									<p key={p.label}>
										<strong className="text-white">{p.label}:</strong> {p.text}
									</p>
								))}
							</div>
						</div>
						<div className="bg-brand-surface p-8 md:p-12 space-y-6">
							<h3 className="text-2xl text-white font-bold uppercase tracking-tight">
								{page.logos.spark.subtitle}
							</h3>
							<div className="bg-brand-bg p-8 border border-brand-dark flex items-center justify-center min-h-[160px]">
								<div
									className="h-20 w-20 bg-brand-accent"
									style={{
										WebkitMaskImage: `url(${page.logos.spark.symbolMaskUrl})`,
										WebkitMaskSize: "contain",
										WebkitMaskRepeat: "no-repeat",
										WebkitMaskPosition: "center",
										maskImage: `url(${page.logos.spark.symbolMaskUrl})`,
										maskSize: "contain",
										maskRepeat: "no-repeat",
										maskPosition: "center",
									}}
									title={page.logos.spark.symbolTitle}
								/>
							</div>
							<div className="space-y-4 text-brand-gray">
								{page.logos.spark.paragraphs.map((p) => (
									<p key={p.label}>
										<strong className="text-white">{p.label}:</strong> {p.text}
									</p>
								))}
							</div>
						</div>
					</div>

					<div className="border border-brand-dark p-8 bg-brand-bg">
						<h3 className="text-sm text-brand-accent uppercase tracking-widest font-mono mb-6">
							{page.logos.strictRules.title}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-brand-gray">
							{page.logos.strictRules.rules.map((rule) => (
								<div key={rule.title}>
									<strong className="text-white block mb-2 uppercase tracking-tight">
										{rule.title}
									</strong>
									<p className="text-sm">{rule.body}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="relative">
					<div className="absolute -top-6 right-0 text-brand-gray text-[10px] font-bold uppercase tracking-widest font-mono">
						{page.palette.id}
					</div>
					<h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-8 border-b border-brand-dark pb-4 font-title">
						{page.palette.title}
					</h2>

					<p className="text-lg text-brand-gray mb-8">{page.palette.intro}</p>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{page.palette.colors.map((c) => (
							<ColorBlock
								key={c.name}
								name={c.name}
								hex={c.hex}
								desc={c.desc}
								border={
									c.accentBorder ? "border-brand-accent" : "border-brand-dark"
								}
							/>
						))}
					</div>
				</section>

				<section className="relative">
					<div className="absolute -top-6 right-0 text-brand-gray text-[10px] font-bold uppercase tracking-widest font-mono">
						{page.typography.id}
					</div>
					<h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-8 border-b border-brand-dark pb-4 font-title">
						{page.typography.title}
					</h2>

					<p className="text-lg text-brand-gray mb-8">{page.typography.intro}</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-brand-dark border border-brand-dark">
						{page.typography.styles.map((style) => {
							const sampleClass = typographySampleClassName(style.name);
							return (
								<div
									key={style.name}
									className="bg-brand-surface p-8 md:p-12 space-y-4"
								>
									<h3 className="text-xl text-white font-bold uppercase tracking-tight">
										{style.name}
									</h3>
									<p className="text-sm text-brand-gray">{style.desc}</p>
									<div className="bg-brand-bg p-6 border border-brand-dark mt-4">
										{style.name.includes("Body") ? (
											<p className={sampleClass}>{style.sample}</p>
										) : (
											<span className={sampleClass}>{style.sample}</span>
										)}
									</div>
								</div>
							);
						})}

						<div className="bg-brand-surface p-8 md:p-12 space-y-4">
							<h3 className="text-xl text-white font-bold uppercase tracking-tight">
								{page.typography.hierarchy.title}
							</h3>
							<div className="space-y-4 text-sm text-brand-gray mt-4">
								{page.typography.hierarchy.items.map((item) => (
									<p key={item.label}>
										<strong className="text-white">{item.label}</strong>{" "}
										{item.text}
									</p>
								))}
							</div>
						</div>
					</div>
				</section>

				<section className="relative">
					<div className="absolute -top-6 right-0 text-brand-gray text-[10px] font-bold uppercase tracking-widest font-mono">
						{page.digitalUx.id}
					</div>
					<h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-8 border-b border-brand-dark pb-4 font-title">
						{page.digitalUx.title}
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-dark border border-brand-dark">
						{page.digitalUx.pillars.map((pillar) => (
							<div key={pillar.title} className="bg-brand-surface p-8 space-y-4">
								<h3 className="text-xl text-white font-bold uppercase tracking-tight">
									{pillar.title}
								</h3>
								<p className="text-sm text-brand-gray leading-relaxed">
									{pillar.body}
								</p>
							</div>
						))}
					</div>
				</section>

				<section className="relative">
					<div className="absolute -top-6 right-0 text-brand-gray text-[10px] font-bold uppercase tracking-widest font-mono">
						{page.physical.id}
					</div>
					<h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-8 border-b border-brand-dark pb-4 font-title">
						{page.physical.title}
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-dark border border-brand-dark">
						{page.physical.pillars.map((pillar) => (
							<div key={pillar.title} className="bg-brand-surface p-8 space-y-4">
								<h3 className="text-xl text-white font-bold uppercase tracking-tight">
									{pillar.title}
								</h3>
								<p className="text-sm text-brand-gray leading-relaxed">
									{pillar.body}
								</p>
							</div>
						))}
					</div>
				</section>

				<section className="relative">
					<div className="absolute -top-6 right-0 text-brand-gray text-[10px] font-bold uppercase tracking-widest font-mono">
						{page.photography.id}
					</div>
					<h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-8 border-b border-brand-dark pb-4 font-title">
						{page.photography.title}
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<div className="border border-brand-accent p-8 bg-brand-surface">
							<h3 className="text-2xl text-brand-accent font-bold uppercase tracking-tight mb-6">
								{page.photography.do.title}
							</h3>
							<ul className="space-y-4 text-white font-medium">
								{page.photography.do.items.map((item) => (
									<li key={item} className="flex gap-3">
										<span className="text-brand-accent">→</span>
										{item}
									</li>
								))}
							</ul>
						</div>
						<div className="border border-brand-dark p-8 bg-brand-bg opacity-75">
							<h3 className="text-2xl text-brand-gray font-bold uppercase tracking-tight mb-6">
								{page.photography.dont.title}
							</h3>
							<ul className="space-y-4 text-brand-gray">
								{page.photography.dont.items.map((item) => (
									<li key={item} className="flex gap-3">
										<span className="text-brand-dark">→</span>
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6">
						<div className="border border-brand-dark bg-brand-surface overflow-hidden group relative">
							<img
								src={page.photography.example.imageUrl}
								alt={page.photography.example.imageAlt}
								className="w-full h-96 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
								referrerPolicy="no-referrer"
							/>
							<div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
								<span className="text-xs font-bold uppercase tracking-widest text-brand-gray font-mono">
									{page.photography.example.caption}
								</span>
							</div>
						</div>
					</div>
				</section>

				<section className="relative">
					<div className="absolute -top-6 right-0 text-brand-gray text-[10px] font-bold uppercase tracking-widest font-mono">
						{page.serializedBrand.id}
					</div>
					<h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white mb-8 border-b border-brand-dark pb-4 font-title">
						{page.serializedBrand.title}
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-dark border border-brand-dark">
						{page.serializedBrand.pillars.map((pillar) => (
							<div key={pillar.title} className="bg-brand-surface p-8 space-y-4">
								<h3 className="text-xl text-white font-bold uppercase tracking-tight">
									{pillar.title}
								</h3>
								<p className="text-sm text-brand-gray leading-relaxed">
									{pillar.body}
								</p>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
