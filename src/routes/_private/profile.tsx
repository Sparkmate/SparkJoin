import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "#/components/page-blocks/page-header";
import { useTRPC } from "#/integrations/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProfileFormState = {
	fullName: string;
	preferredName: string;
	phone: string;
	currentLocation: string;
};

function buildFormState(profile: {
	fullName: string;
	preferredName: string | null;
	phone: string | null;
	currentLocation: string | null;
}): ProfileFormState {
	return {
		fullName: profile.fullName ?? "",
		preferredName: profile.preferredName ?? "",
		phone: profile.phone ?? "",
		currentLocation: profile.currentLocation ?? "",
	};
}

export const Route = createFileRoute("/_private/profile")({
	loader: async ({ context }) =>
		context.queryClient.ensureQueryData(
			context.trpc.candidate.profile.getMyProfile.queryOptions(),
		),
	component: RouteComponent,
});

function RouteComponent() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const formId = useId();
	const loaderData = Route.useLoaderData();
	const [form, setForm] = useState<ProfileFormState>(() =>
		buildFormState(loaderData.profile),
	);
	const getMyProfileOptions =
		trpc.candidate.profile.getMyProfile.queryOptions();

	const updateField = <TKey extends keyof ProfileFormState>(
		key: TKey,
		value: ProfileFormState[TKey],
	) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const saveMutation = useMutation(
		trpc.candidate.profile.upsertMyProfile.mutationOptions({
			onSuccess: (data) => {
				queryClient.setQueryData(getMyProfileOptions.queryKey, data);
				toast.success("Profile saved", {
					description:
						"Your candidate profile is updated. SparkCrew will use this for your application review and interview planning.",
				});
			},
			onError: (error) => {
				toast.error("Could not save profile", {
					description: error.message,
				});
			},
		}),
	);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await saveMutation.mutateAsync({
			fullName: form.fullName,
			position: "",
			preferredName: form.preferredName,
			phone: form.phone,
			currentLocation: form.currentLocation,
			links: [],
			proofOfWorkSummary: "",
			biggestAchievement: "",
			whySparkmate: "",
			note: "",
		});
	};

	return (
		<div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
			<PageHeader
				title="Profile"
				description={{
					title: "Keep your basic contact details up to date.",
				}}
			/>
			<form onSubmit={onSubmit} className="space-y-8">
				<section className="border border-brand-dark bg-brand-surface p-6 md:p-8">
					<h2 className="mb-5">Basic Information</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor={`${formId}-full-name`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Full name
							</label>
							<Input
								id={`${formId}-full-name`}
								value={form.fullName}
								onChange={(event) =>
									updateField("fullName", event.target.value)
								}
								placeholder="Your legal name"
							/>
						</div>
						<div>
							<label
								htmlFor={`${formId}-preferred-name`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Preferred name (optional)
							</label>
							<Input
								id={`${formId}-preferred-name`}
								value={form.preferredName}
								onChange={(event) =>
									updateField("preferredName", event.target.value)
								}
								placeholder="What should we call you?"
							/>
						</div>
						<div>
							<label
								htmlFor={`${formId}-phone`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Phone / WhatsApp
							</label>
							<Input
								id={`${formId}-phone`}
								value={form.phone}
								onChange={(event) => updateField("phone", event.target.value)}
								placeholder="+852 ..."
							/>
						</div>
						<div>
							<label
								htmlFor={`${formId}-location`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Current location
							</label>
							<Input
								id={`${formId}-location`}
								value={form.currentLocation}
								onChange={(event) =>
									updateField("currentLocation", event.target.value)
								}
								placeholder="City, Country"
							/>
						</div>
					</div>
				</section>

				<div className="sticky bottom-4 flex justify-end">
					<Button
						type="submit"
						disabled={saveMutation.isPending}
						className="px-6 py-3 border border-brand-dark bg-brand-primary text-brand-bg hover:opacity-90"
					>
						{saveMutation.isPending ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Saving...
							</>
						) : (
							"Save Profile"
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
