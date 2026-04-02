import { createFileRoute } from "@tanstack/react-router";
import { Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "#/components/page-blocks/page-header";
import { asConfigByKey } from "#/config/config-content";

export const Route = createFileRoute("/_private/brand/assets")({
	component: BrandAssets,
	loader: async ({ context }) => {
		const row = await context.queryClient.ensureQueryData(
			context.trpc.config.get.queryOptions({ key: "brand" }),
		);
		if (!row) return null;
		return asConfigByKey("brand", row.value);
	},
});

function BrandAssets() {
	const brandData = Route.useLoaderData();

	const [copiedColor, setCopiedColor] = useState<string | null>(null);

	const downloadAsset = async (url: string, filename: string) => {
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const blobUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = blobUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(blobUrl);
		} catch (err) {
			console.error("Failed to download asset:", err);
			// Fallback to opening in new tab
			window.open(url, "_blank");
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
			<PageHeader
				title="Brand Assets"
				description={{
					title: "Official logos, colors, and typography",
					content: "Sourced directly from Brandfetch.",
				}}
			>
				{/* {isAdmin && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-6 py-4 bg-brand-surface hover:bg-brand-dark hover:text-white border border-brand-dark hover:border-brand-dark transition-none text-sm font-bold uppercase tracking-widest disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "SYNCING..." : "SYNC FROM BRANDFETCH"}
          </button>
        )} */}
			</PageHeader>

			{brandData && (
				<div className="space-y-24">
					{/* Logos Section */}
					{brandData.logos &&
						brandData.logos.filter((l) => l.type !== "icon").length > 0 && (
							<section>
								<h2 className="text-3xl font-bold uppercase tracking-tight text-white mb-12 border-b border-brand-dark pb-4 font-title">
									Logos
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
									{brandData.logos
										.filter((l) => l.type !== "icon")
										.map((logo) => {
											const svgFormat = logo.formats.find(
												(f) => f.format === "svg",
											);
											const pngFormat = logo.formats.find(
												(f) => f.format === "png",
											);
											const displaySrc =
												svgFormat?.src ||
												pngFormat?.src ||
												logo.formats[0]?.src;

											// A "light" logo is meant for a dark background, and vice versa
											const bgClass =
												logo.theme === "light"
													? "bg-[#141414]"
													: "bg-[#E4E3E0]";

											return (
												<div
													key={`${logo.type}-${logo.theme}`}
													className="border border-brand-dark bg-brand-surface flex flex-col hover:border-brand-accent transition-none"
												>
													<div
														className={`h-64 flex items-center justify-center p-12 relative group ${bgClass}`}
													>
														<img
															src={displaySrc}
															alt={`${brandData.name} ${logo.type}`}
															className="max-w-full max-h-full object-contain"
														/>
													</div>
													<div className="p-6 flex flex-col gap-6 flex-1 justify-between">
														<div>
															<h3 className="text-white font-bold uppercase tracking-wider">
																{logo.type}
															</h3>
															<p className="text-sm text-brand-gray uppercase tracking-widest font-mono mt-1">
																{logo.theme} THEME
															</p>
														</div>
														<div className="flex gap-4">
															{svgFormat && (
																<button
																	type="button"
																	onClick={() =>
																		downloadAsset(
																			svgFormat.src,
																			`${brandData.name}-${logo.type}-${logo.theme}.svg`,
																		)
																	}
																	className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-bg hover:bg-brand-dark hover:text-white border border-brand-dark hover:border-brand-dark text-xs font-bold uppercase tracking-widest transition-none"
																>
																	<Download className="w-4 h-4" />
																	SVG
																</button>
															)}
															{pngFormat && (
																<button
																	type="button"
																	onClick={() =>
																		downloadAsset(
																			pngFormat.src,
																			`${brandData.name}-${logo.type}-${logo.theme}.png`,
																		)
																	}
																	className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-bg hover:bg-brand-dark hover:text-white border border-brand-dark hover:border-brand-dark text-xs font-bold uppercase tracking-widest transition-none"
																>
																	<Download className="w-4 h-4" />
																	PNG
																</button>
															)}
														</div>
													</div>
												</div>
											);
										})}
								</div>
							</section>
						)}

					{/* Colors Section */}
					{brandData.colors && brandData.colors.length > 0 && (
						<section>
							<h2 className="text-3xl font-bold uppercase tracking-tight text-white mb-12 border-b border-brand-dark pb-4 font-title">
								Colors
							</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
								{brandData.colors.map((color) => (
									<button
										key={`${color.hex}-${color.type}`}
										type="button"
										className="border border-brand-dark bg-brand-surface group cursor-pointer hover:border-brand-accent transition-none text-left w-full"
										onClick={() => {
											navigator.clipboard.writeText(color.hex);
											setCopiedColor(color.hex);
											setTimeout(() => setCopiedColor(null), 2000);
										}}
										title="Click to copy HEX"
									>
										<div
											className="h-32 w-full relative"
											style={{ backgroundColor: color.hex }}
										>
											<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-none bg-black/20 backdrop-blur-[2px]">
												<span className="text-white text-xs font-bold uppercase tracking-widest px-3 py-2 bg-black/80">
													{copiedColor === color.hex ? "COPIED!" : "COPY HEX"}
												</span>
											</div>
										</div>
										<div className="p-4">
											<p className="text-white font-mono text-sm uppercase tracking-widest">
												{color.hex}
											</p>
											<p className="text-xs text-brand-gray uppercase tracking-widest mt-2">
												{color.type}
											</p>
										</div>
									</button>
								))}
							</div>
						</section>
					)}

					{/* Fonts Section */}
					{brandData.fonts && brandData.fonts.length > 0 && (
						<section>
							<h2 className="text-3xl font-bold uppercase tracking-tight text-white mb-12 border-b border-brand-dark pb-4 font-title">
								Typography
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								{brandData.fonts.map((font) => (
									<div
										key={`${font.name}-${font.type}-${font.originId}`}
										className="border border-brand-dark p-8 bg-brand-surface flex justify-between items-center hover:border-brand-accent transition-none"
									>
										<div>
											<h3 className="text-2xl text-white font-bold uppercase tracking-tight">
												{font.name}
											</h3>
											<p className="text-sm text-brand-gray uppercase tracking-widest font-mono mt-2">
												{font.type} FONT
											</p>
										</div>
										{font.origin === "google" && (
											<a
												href={`https://fonts.google.com/specimen/${font.originId}`}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-accent hover:text-white transition-none"
											>
												VIEW ON GOOGLE FONTS
												<ExternalLink className="w-4 h-4" />
											</a>
										)}
									</div>
								))}
							</div>
						</section>
					)}

					{/* Icons Section */}
					{brandData.logos &&
						brandData.logos.filter((l) => l.type === "icon").length > 0 && (
							<section>
								<h2 className="text-3xl font-bold uppercase tracking-tight text-white mb-12 border-b border-brand-dark pb-4 font-title">
									Icons
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
									{brandData.logos
										.filter((l) => l.type === "icon")
										.map((icon) => {
											const svgFormat = icon.formats.find(
												(f) => f.format === "svg",
											);
											const pngFormat = icon.formats.find(
												(f) => f.format === "png",
											);
											const displaySrc =
												svgFormat?.src ||
												pngFormat?.src ||
												icon.formats[0]?.src;

											// A "light" icon is meant for a dark background, and vice versa
											const bgClass =
												icon.theme === "light"
													? "bg-[#141414]"
													: "bg-[#E4E3E0]";

											return (
												<div
													key={`${icon.type}-${icon.theme}`}
													className="border border-brand-dark bg-brand-surface flex flex-col hover:border-brand-accent transition-none"
												>
													<div
														className={`h-48 flex items-center justify-center p-8 relative group ${bgClass}`}
													>
														<img
															src={displaySrc}
															alt={`${brandData.name} ${icon.type}`}
															className="max-w-full max-h-full object-contain"
														/>
													</div>
													<div className="p-6 flex flex-col gap-6 flex-1 justify-between">
														<div>
															<h3 className="text-white font-bold uppercase tracking-wider">
																{icon.type}
															</h3>
															<p className="text-sm text-brand-gray uppercase tracking-widest font-mono mt-1">
																{icon.theme} THEME
															</p>
														</div>
														<div className="flex gap-4">
															{svgFormat && (
																<button
																	type="button"
																	onClick={() =>
																		downloadAsset(
																			svgFormat.src,
																			`${brandData.name}-${icon.type}-${icon.theme}.svg`,
																		)
																	}
																	className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-bg hover:bg-brand-dark hover:text-white border border-brand-dark hover:border-brand-dark text-xs font-bold uppercase tracking-widest transition-none"
																>
																	<Download className="w-4 h-4" />
																	SVG
																</button>
															)}
															{pngFormat && (
																<button
																	type="button"
																	onClick={() =>
																		downloadAsset(
																			pngFormat.src,
																			`${brandData.name}-${icon.type}-${icon.theme}.png`,
																		)
																	}
																	className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-bg hover:bg-brand-dark hover:text-white border border-brand-dark hover:border-brand-dark text-xs font-bold uppercase tracking-widest transition-none"
																>
																	<Download className="w-4 h-4" />
																	PNG
																</button>
															)}
														</div>
													</div>
												</div>
											);
										})}
								</div>
							</section>
						)}

					{/* Brand Info Section */}
					<section>
						<h2 className="text-3xl font-bold uppercase tracking-tight text-white mb-12 border-b border-brand-dark pb-4 font-title">
							Brand Information
						</h2>
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
							<div className="lg:col-span-2 space-y-8">
								{brandData.description && (
									<div>
										<h3 className="text-sm text-brand-gray uppercase tracking-widest font-mono mb-3">
											Short Description
										</h3>
										<p className="text-xl text-white font-medium leading-relaxed">
											{brandData.description}
										</p>
									</div>
								)}
								{brandData.longDescription && (
									<div>
										<h3 className="text-sm text-brand-gray uppercase tracking-widest font-mono mb-3">
											Long Description
										</h3>
										<div className="text-brand-gray leading-relaxed space-y-4 whitespace-pre-wrap">
											{brandData.longDescription}
										</div>
									</div>
								)}
							</div>
							<div>
								<h3 className="text-sm text-brand-gray uppercase tracking-widest font-mono mb-6">
									Official Links
								</h3>
								{brandData.links && brandData.links.length > 0 ? (
									<div className="flex flex-col gap-4">
										{brandData.links.map((link) => (
											<a
												key={`${link.url}-${link.name}`}
												href={link.url}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center justify-between p-4 border border-brand-dark bg-brand-surface hover:border-brand-accent hover:text-brand-accent transition-none group"
											>
												<span className="font-bold uppercase tracking-widest text-sm text-white group-hover:text-brand-accent">
													{link.name}
												</span>
												<ExternalLink className="w-4 h-4" />
											</a>
										))}
									</div>
								) : (
									<p className="text-brand-gray text-sm">No links available.</p>
								)}
							</div>
						</div>
					</section>
				</div>
			)}
		</div>
	);
}
