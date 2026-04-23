import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Ban, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "#/components/page-blocks/page-header";
import { useTRPC } from "#/integrations/trpc/react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

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
	const listCandidatesQueryOptions = trpc.user.listCandidates.queryOptions();

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
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
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

							return (
								<TableRow key={candidate.id}>
									<TableCell className="text-brand-light">
										{candidate.name}
									</TableCell>
									<TableCell className="text-brand-light">
										{candidate.email}
									</TableCell>
									<TableCell className="uppercase text-brand-accent">
										{candidate.role ?? "candidate"}
									</TableCell>
									<TableCell>
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
									<TableCell>
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
												className="bg-brand-bg border border-brand-dark px-3 py-2 text-sm text-brand-light uppercase tracking-wider"
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
							);
						})}
					</TableBody>
				</Table>
			</section>
		</div>
	);
}
