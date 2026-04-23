import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Ban,
	ChevronDown,
	Info,
	Link as LinkIcon,
	Loader2,
	Mail,
	MapPin,
	Phone,
	UserRound,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "#/components/page-blocks/page-header";
import { useTRPC } from "#/integrations/trpc/react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type BanReason = "rejected" | "other";

export const Route = createFileRoute("/_private/admin/candidates")({
	loader: async ({ context }) =>
		context.queryClient.ensureQueryData(
			context.trpc.user.listCandidates.queryOptions(),
		),
	component: RouteComponent,
});

function RouteComponent() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const data = Route.useLoaderData();
	const [reasonByUserId, setReasonByUserId] = useState<Record<string, BanReason>>(
		{},
	);
	const [expandedCandidateIds, setExpandedCandidateIds] = useState<
		Record<string, boolean>
	>({});
	const listCandidatesQueryOptions = trpc.user.listCandidates.queryOptions();
	const activeCount = useMemo(
		() => data.candidates.filter((candidate) => !candidate.banned).length,
		[data.candidates],
	);

	const banMutation = useMutation(
		trpc.user.banCandidate.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: listCandidatesQueryOptions.queryKey,
				});
				toast.success("Candidate banned");
			},
			onError: (error) => {
				toast.error("Could not ban candidate", {
					description: error.message,
				});
			},
		}),
	);

	return (
		<div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
			<PageHeader
				title="Candidates"
				description={{
					title:
						"Review candidate users and ban when needed with a recorded reason.",
				}}
			/>

			<section className="border border-brand-dark bg-brand-surface p-6 md:p-8">
				<Table containerClassName="overflow-x-auto">
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Position</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Touchpoints</TableHead>
							<TableHead>Ban Reason</TableHead>
							<TableHead className="text-right">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.candidates.map((candidate) => {
							const selectedReason = reasonByUserId[candidate.id] ?? "rejected";
							const isPending =
								banMutation.isPending &&
								banMutation.variables?.userId === candidate.id;
							const isExpanded = expandedCandidateIds[candidate.id] ?? false;
							const preferredDisplayName =
								candidate.profile?.preferredName?.trim() || candidate.name;
							const positionDisplay =
								candidate.profile?.position?.trim() || "Not provided";
							const profile = candidate.profile;
							const completedHiringSteps = candidate.hiringProgress.filter(
								(step) =>
									step.status.toLowerCase() === "done" ||
									step.status.toLowerCase() === "completed",
							);

							return (
								<Fragment key={candidate.id}>
									<TableRow className={cn(isExpanded && "bg-brand-bg/60")}>
										<TableCell className="max-w-[220px] whitespace-normal wrap-break-word text-brand-light">
											<Collapsible
												open={isExpanded}
												onOpenChange={(open) =>
													setExpandedCandidateIds((prev) => ({
														...prev,
														[candidate.id]: open,
													}))
												}
											>
												<CollapsibleTrigger asChild>
													<button
														type="button"
														className="group inline-flex items-center gap-2 text-left"
													>
														<span>{preferredDisplayName}</span>
														<ChevronDown
															className={cn(
																"h-4 w-4 text-brand-primary transition-transform duration-200",
																isExpanded && "rotate-180",
															)}
														/>
													</button>
												</CollapsibleTrigger>
											</Collapsible>
										</TableCell>
										<TableCell className="max-w-[280px] whitespace-normal break-all text-brand-light">
											{candidate.email}
										</TableCell>
										<TableCell className="max-w-[220px] whitespace-normal wrap-break-word text-brand-light">
											{positionDisplay}
										</TableCell>
										<TableCell className="whitespace-normal">
											{candidate.banned ? (
												<span className="text-red-400 uppercase text-xs tracking-widest">
													Banned
												</span>
											) : (
												<span className="text-emerald-400 uppercase text-xs tracking-widest">
													Active
												</span>
											)}
										</TableCell>
										<TableCell className="whitespace-normal text-brand-light">
											{candidate.emailInteractions.length} emails
										</TableCell>
										<TableCell className="whitespace-normal">
											{candidate.banned ? (
												<span className="text-brand-light">
													{candidate.banReason ?? "-"}
												</span>
											) : (
												<select
													value={selectedReason}
													onChange={(event) =>
														setReasonByUserId((prev) => ({
															...prev,
															[candidate.id]: event.target.value as BanReason,
														}))
													}
													className="w-full max-w-[160px] bg-brand-bg border border-brand-dark px-3 py-2 text-sm text-brand-light uppercase tracking-wider"
												>
													<option value="rejected">rejected</option>
													<option value="other">other</option>
												</select>
											)}
										</TableCell>
										<TableCell className="text-right">
											<Button
												type="button"
												variant="outline"
												disabled={candidate.banned || isPending}
												onClick={async () => {
													await banMutation.mutateAsync({
														userId: candidate.id,
														reason: selectedReason,
													});
												}}
												className="min-w-28 justify-center"
											>
												{isPending ? (
													<>
														<Loader2 className="w-4 h-4 mr-2 animate-spin" />
														Banning...
													</>
												) : (
													<>
														<Ban className="w-4 h-4 mr-2" />
														Ban
													</>
												)}
											</Button>
										</TableCell>
									</TableRow>
									<TableRow className={cn(!isExpanded && "hidden")}>
										<TableCell colSpan={7} className="p-0">
											<Collapsible open={isExpanded}>
												<CollapsibleContent>
													<div className="grid gap-4 border-t border-brand-dark bg-brand-bg p-4 md:p-6 lg:grid-cols-3">
														<div className="min-w-0 space-y-4 border border-brand-dark bg-brand-surface p-4">
															<h3 className="text-sm uppercase tracking-wider text-brand-accent">
																Candidate Profile
															</h3>
															<div className="rounded-md border border-brand-dark bg-brand-bg p-3">
																<div className="flex items-start gap-3">
																	<div className="mt-0.5 rounded-md border border-brand-dark bg-brand-surface p-2">
																		<UserRound className="h-4 w-4 text-brand-primary" />
																	</div>
																	<div className="min-w-0">
																		<p className="whitespace-normal wrap-break-word text-brand-light">
																			{profile?.fullName || candidate.name}
																		</p>
																		<p className="text-xs uppercase tracking-wider text-brand-accent">
																			Preferred: {profile?.preferredName || "-"}
																		</p>
																		<p className="mt-1 whitespace-normal wrap-break-word text-xs text-brand-primary">
																			{profile?.position || "Position not provided"}
																		</p>
																	</div>
																</div>
															</div>
															<div className="grid gap-2 text-sm text-brand-light sm:grid-cols-2">
																<div className="rounded-md border border-brand-dark bg-brand-bg p-2.5">
																	<p className="mb-1 text-[10px] uppercase tracking-wider text-brand-accent">
																		Phone
																	</p>
																	<p className="inline-flex items-center gap-2 whitespace-normal wrap-break-word">
																		<Phone className="h-3.5 w-3.5 text-brand-primary" />
																		{profile?.phone || "-"}
																	</p>
																</div>
																<div className="rounded-md border border-brand-dark bg-brand-bg p-2.5">
																	<p className="mb-1 text-[10px] uppercase tracking-wider text-brand-accent">
																		Location
																	</p>
																	<p className="inline-flex items-center gap-2 whitespace-normal wrap-break-word">
																		<MapPin className="h-3.5 w-3.5 text-brand-primary" />
																		{profile?.currentLocation || "-"}
																	</p>
																</div>
															</div>
															<div className="rounded-md border border-brand-dark bg-brand-bg p-3">
																<p className="mb-2 text-[10px] uppercase tracking-wider text-brand-accent">
																	Links
																</p>
																{profile?.links?.length ? (
																	<div className="flex flex-wrap gap-2">
																		{profile.links.map((link) => (
																			<a
																				key={link}
																				href={link}
																				target="_blank"
																				rel="noreferrer"
																				className="inline-flex max-w-full items-center gap-1 rounded-md border border-brand-dark bg-brand-surface px-2 py-1 text-xs text-brand-light hover:text-brand-primary"
																			>
																				<LinkIcon className="h-3 w-3 shrink-0" />
																				<span className="truncate">{link}</span>
																			</a>
																		))}
																	</div>
																) : (
																	<p className="text-sm text-brand-light">-</p>
																)}
															</div>
															<div className="space-y-2">
																<div className="rounded-md border border-brand-dark bg-brand-bg p-3">
																	<p className="mb-1 text-[10px] uppercase tracking-wider text-brand-accent">
																		Proof of work
																	</p>
																	<p className="whitespace-normal wrap-break-word text-sm text-brand-light">
																		{profile?.proofOfWorkSummary || "-"}
																	</p>
																</div>
																<div className="rounded-md border border-brand-dark bg-brand-bg p-3">
																	<p className="mb-1 text-[10px] uppercase tracking-wider text-brand-accent">
																		Biggest achievement
																	</p>
																	<p className="whitespace-normal wrap-break-word text-sm text-brand-light">
																		{profile?.biggestAchievement || "-"}
																	</p>
																</div>
																<div className="rounded-md border border-brand-dark bg-brand-bg p-3">
																	<p className="mb-1 text-[10px] uppercase tracking-wider text-brand-accent">
																		Why Sparkmate
																	</p>
																	<p className="whitespace-normal wrap-break-word text-sm text-brand-light">
																		{profile?.whySparkmate || "-"}
																	</p>
																</div>
																<div className="rounded-md border border-brand-dark bg-brand-bg p-3">
																	<p className="mb-1 text-[10px] uppercase tracking-wider text-brand-accent">
																		Internal note
																	</p>
																	<p className="whitespace-normal wrap-break-word text-sm text-brand-light">
																		{profile?.note || "-"}
																	</p>
																</div>
															</div>
														</div>

														<div className="min-w-0 space-y-3 border border-brand-dark bg-brand-surface p-4">
															<h3 className="text-sm uppercase tracking-wider text-brand-accent">
																Email Interactions
															</h3>
															<div className="space-y-2">
																{candidate.emailInteractions.length === 0 ? (
																	<p className="text-sm text-brand-light">
																		No email interactions yet.
																	</p>
										) : (
																	candidate.emailInteractions.map((email) => (
																		<div
																			key={email.id}
																			className="min-w-0 border border-brand-dark bg-brand-bg p-3 text-sm"
																		>
																			<p
																				className={cn(
																					"inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs uppercase tracking-wider w-fit",
																					email.direction.toLowerCase() === "inbound"
																						? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
																						: "border-sky-400/40 bg-sky-500/10 text-sky-300",
																				)}
																			>
																				<Mail className="h-3.5 w-3.5" />
																				{email.direction}
																			</p>
																			<p className="mt-1 whitespace-normal wrap-break-word text-brand-light">
																				{email.shortSummary}
																			</p>
																			<p className="mt-1 text-xs text-brand-primary">
																				{new Date(email.createdAt).toLocaleString()}
																			</p>
																		</div>
																	))
										)}
															</div>
														</div>

														<div className="min-w-0 space-y-3 border border-brand-dark bg-brand-surface p-4">
															<h3 className="text-sm uppercase tracking-wider text-brand-accent">
																Hiring Steps
															</h3>
															<div className="space-y-2">
																{completedHiringSteps.length === 0 ? (
																	<p className="text-sm text-brand-light">
																		No completed steps yet.
																	</p>
																) : (
																	completedHiringSteps.map((step) => (
																		<div
																			key={step.stepKey}
																			className="min-w-0 border border-brand-dark bg-brand-bg p-3"
																		>
																			<div className="flex items-center justify-between gap-3">
																				<div className="flex min-w-0 items-center gap-2">
																					<p className="min-w-0 whitespace-normal wrap-break-word text-sm text-brand-light">
																						{step.name}
																					</p>
																					{step.description ? (
																						<TooltipProvider>
																							<Tooltip>
																								<TooltipTrigger asChild>
																									<button
																										type="button"
																										className="inline-flex text-brand-primary"
																										aria-label={`More information about ${step.name}`}
																									>
																										<Info className="h-3.5 w-3.5" />
																									</button>
																								</TooltipTrigger>
																								<TooltipContent
																									side="top"
																									sideOffset={6}
																									className="max-w-xs whitespace-normal wrap-break-word"
																								>
																									{step.description}
																								</TooltipContent>
																							</Tooltip>
																						</TooltipProvider>
																					) : null}
																				</div>
																				<span className="text-[10px] uppercase tracking-widest text-emerald-400">
																					{step.status}
																				</span>
																			</div>
																			{step.note ? (
																				<p className="mt-2 whitespace-normal wrap-break-word text-xs text-brand-light">
																					Note: {step.note}
																				</p>
																			) : null}
																		</div>
																	))
																)}
															</div>
														</div>
													</div>
												</CollapsibleContent>
											</Collapsible>
										</TableCell>
									</TableRow>
								</Fragment>
							);
						})}
					</TableBody>
				</Table>
				<div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-wider text-brand-accent">
					<span>{data.candidates.length} total candidates</span>
					<span>{activeCount} active</span>
					<span>{data.candidates.length - activeCount} banned</span>
				</div>
			</section>
		</div>
	);
}
