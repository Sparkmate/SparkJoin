import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Save, Trash2, Upload } from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "#/components/page-blocks/page-header";
import { useTRPC } from "#/integrations/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormState = {
	fullName: string;
	preferredName: string;
	phone: string;
	currentLocation: string;
	linkedinUrl: string;
	githubUrl: string;
	portfolioDocumentUrls: string[];
	workSampleDocumentUrls: string[];
	proofOfWorkSummary: string;
	biggestAchievement: string;
	whySparkmate: string;
	buildStrengthsText: string;
	workAuthorization: string;
	earliestStartDate: string;
	interviewAvailability: string;
	canAttendHongKongOnsite: boolean;
	additionalContext: string;
};

function parseCsv(valuesText: string): string[] {
	return valuesText
		.split(",")
		.map((value) => value.trim())
		.filter((value) => value.length > 0);
}

function buildFormState(profile: {
	fullName: string;
	preferredName: string | null;
	phone: string | null;
	currentLocation: string | null;
	linkedinUrl: string | null;
	githubUrl: string | null;
	portfolioDocumentUrls: string[];
	workSampleDocumentUrls: string[];
	proofOfWorkSummary: string | null;
	biggestAchievement: string | null;
	whySparkmate: string | null;
	buildStrengths: string[];
	workAuthorization: string | null;
	earliestStartDate: string | null;
	interviewAvailability: string | null;
	canAttendHongKongOnsite: boolean;
	additionalContext: string | null;
}): ProfileFormState {
	return {
		fullName: profile.fullName ?? "",
		preferredName: profile.preferredName ?? "",
		phone: profile.phone ?? "",
		currentLocation: profile.currentLocation ?? "",
		linkedinUrl: profile.linkedinUrl ?? "",
		githubUrl: profile.githubUrl ?? "",
		portfolioDocumentUrls: profile.portfolioDocumentUrls ?? [],
		workSampleDocumentUrls: profile.workSampleDocumentUrls ?? [],
		proofOfWorkSummary: profile.proofOfWorkSummary ?? "",
		biggestAchievement: profile.biggestAchievement ?? "",
		whySparkmate: profile.whySparkmate ?? "",
		buildStrengthsText: (profile.buildStrengths ?? []).join(", "),
		workAuthorization: profile.workAuthorization ?? "",
		earliestStartDate: profile.earliestStartDate ?? "",
		interviewAvailability: profile.interviewAvailability ?? "",
		canAttendHongKongOnsite: profile.canAttendHongKongOnsite ?? false,
		additionalContext: profile.additionalContext ?? "",
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
	const [uploadingKind, setUploadingKind] = useState<
		"portfolio" | "work-sample" | null
	>(null);
	const getMyProfileOptions =
		trpc.candidate.profile.getMyProfile.queryOptions();

	const completion = useMemo(() => {
		const checks = [
			form.fullName.trim().length > 1,
			form.phone.trim().length > 0,
			form.currentLocation.trim().length > 0,
			form.portfolioDocumentUrls.length > 0,
			form.workSampleDocumentUrls.length > 0,
			form.proofOfWorkSummary.trim().length > 30,
			form.biggestAchievement.trim().length > 30,
			form.whySparkmate.trim().length > 30,
			form.interviewAvailability.trim().length > 0,
		];
		const completed = checks.filter(Boolean).length;
		const total = checks.length;
		return {
			completed,
			total,
			percentage: Math.round((completed / total) * 100),
		};
	}, [form]);

	const updateField = <TKey extends keyof ProfileFormState>(
		key: TKey,
		value: ProfileFormState[TKey],
	) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const uploadDocument = async (
		kind: "portfolio" | "work-sample",
		file: File,
	) => {
		if (file.type !== "application/pdf") {
			toast.error("Only PDF files are supported");
			return;
		}

		const body = new FormData();
		body.append("kind", kind);
		body.append("file", file);
		setUploadingKind(kind);

		try {
			const response = await fetch("/api/candidate-documents", {
				method: "POST",
				body,
			});
			const json = (await response.json()) as { url?: string; error?: string };

			if (!response.ok || !json.url) {
				throw new Error(json.error ?? "Upload failed");
			}

			const targetField =
				kind === "portfolio"
					? "portfolioDocumentUrls"
					: "workSampleDocumentUrls";
			setForm((prev) => ({
				...prev,
				[targetField]: Array.from(new Set([...prev[targetField], json.url])),
			}));

			toast.success("PDF uploaded", {
				description: "Remember to click Save Candidate Profile to persist it.",
			});
		} catch (error) {
			toast.error("Could not upload PDF", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			setUploadingKind(null);
		}
	};

	const removeDocument = (kind: "portfolio" | "work-sample", url: string) => {
		const targetField =
			kind === "portfolio" ? "portfolioDocumentUrls" : "workSampleDocumentUrls";
		setForm((prev) => ({
			...prev,
			[targetField]: prev[targetField].filter((item) => item !== url),
		}));
	};

	const getDocumentName = (url: string) => {
		const segments = url.split("/");
		const raw = segments[segments.length - 1] ?? "document.pdf";
		return decodeURIComponent(raw);
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
			preferredName: form.preferredName,
			phone: form.phone,
			currentLocation: form.currentLocation,
			linkedinUrl: form.linkedinUrl,
			githubUrl: form.githubUrl,
			portfolioLinks: [],
			workSampleLinks: [],
			portfolioDocumentUrls: form.portfolioDocumentUrls,
			workSampleDocumentUrls: form.workSampleDocumentUrls,
			proofOfWorkSummary: form.proofOfWorkSummary,
			biggestAchievement: form.biggestAchievement,
			whySparkmate: form.whySparkmate,
			buildStrengths: parseCsv(form.buildStrengthsText),
			workAuthorization: form.workAuthorization,
			earliestStartDate: form.earliestStartDate,
			interviewAvailability: form.interviewAvailability,
			canAttendHongKongOnsite: form.canAttendHongKongOnsite,
			additionalContext: form.additionalContext,
		});
	};

	return (
		<div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
			<PageHeader
				title="Candidate Profile"
				description={{
					title:
						"Help us understand what you build and how you work. This profile powers your Sparkmate application review.",
				}}
			/>

			<motion.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-8 border border-brand-dark bg-brand-surface p-6 md:p-8"
			>
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h2 className="mb-2">Application Readiness</h2>
						<p>
							Complete the essentials below so we can evaluate your application
							properly and schedule interviews faster.
						</p>
					</div>
					<div className="border border-brand-dark bg-brand-bg px-4 py-3">
						<p className="text-white text-2xl font-semibold font-title max-w-none">
							{completion.completed}/{completion.total}
						</p>
						<p className="text-brand-gray text-sm max-w-none normal-case tracking-normal font-sans">
							Essentials complete
						</p>
					</div>
				</div>
				<div className="mt-5 h-2 border border-brand-dark bg-brand-bg overflow-hidden">
					<div
						className="h-full bg-brand-primary transition-all duration-300"
						style={{ width: `${completion.percentage}%` }}
					/>
				</div>
			</motion.section>

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
						<div>
							<label
								htmlFor={`${formId}-work-authorization`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Work authorization (optional)
							</label>
							<Input
								id={`${formId}-work-authorization`}
								value={form.workAuthorization}
								onChange={(event) =>
									updateField("workAuthorization", event.target.value)
								}
								placeholder="Visa status / permit details"
							/>
						</div>
					</div>
				</section>

				<section className="border border-brand-dark bg-brand-surface p-6 md:p-8">
					<h2 className="mb-5">Proof of Work (No CVs)</h2>
					<p className="mb-5">
						Upload PDF documents that summarize what you have built (project
						briefs, build logs, design docs, photo sheets, spec docs, etc.).
						These documents are easier for our internal LLM review pipeline to
						parse consistently.
					</p>
					<div className="space-y-4">
						<div className="border border-brand-dark bg-brand-bg p-4">
							<label
								htmlFor={`${formId}-portfolio-docs`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Main portfolio PDFs
							</label>
							<div className="flex flex-wrap items-center gap-3 mb-3">
								<Input
									id={`${formId}-portfolio-docs`}
									type="file"
									accept="application/pdf,.pdf"
									onChange={(event) => {
										const file = event.target.files?.[0];
										if (!file) return;
										void uploadDocument("portfolio", file);
										event.currentTarget.value = "";
									}}
									disabled={uploadingKind !== null}
									className="max-w-sm"
								/>
								{uploadingKind === "portfolio" ? (
									<span className="text-brand-gray normal-case tracking-normal font-sans text-sm flex items-center gap-2">
										<Loader2 className="w-4 h-4 animate-spin" />
										Uploading...
									</span>
								) : (
									<span className="text-brand-gray normal-case tracking-normal font-sans text-sm">
										PDF only, max 20MB each.
									</span>
								)}
							</div>
							<div className="space-y-2">
								{form.portfolioDocumentUrls.length === 0 ? (
									<p className="text-brand-gray text-sm normal-case tracking-normal font-sans max-w-none">
										No portfolio PDF uploaded yet.
									</p>
								) : (
									form.portfolioDocumentUrls.map((url) => (
										<div
											key={url}
											className="flex items-center justify-between gap-3 border border-brand-dark px-3 py-2"
										>
											<a
												href={url}
												target="_blank"
												rel="noreferrer"
												className="text-brand-light normal-case tracking-normal font-sans text-sm truncate hover:text-brand-primary"
											>
												{getDocumentName(url)}
											</a>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeDocument("portfolio", url)}
												className="text-red-300 hover:text-red-200"
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									))
								)}
							</div>
						</div>
						<div className="border border-brand-dark bg-brand-bg p-4">
							<label
								htmlFor={`${formId}-work-sample-docs`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Best work sample PDFs
							</label>
							<div className="flex flex-wrap items-center gap-3 mb-3">
								<Input
									id={`${formId}-work-sample-docs`}
									type="file"
									accept="application/pdf,.pdf"
									onChange={(event) => {
										const file = event.target.files?.[0];
										if (!file) return;
										void uploadDocument("work-sample", file);
										event.currentTarget.value = "";
									}}
									disabled={uploadingKind !== null}
									className="max-w-sm"
								/>
								{uploadingKind === "work-sample" ? (
									<span className="text-brand-gray normal-case tracking-normal font-sans text-sm flex items-center gap-2">
										<Loader2 className="w-4 h-4 animate-spin" />
										Uploading...
									</span>
								) : (
									<span className="text-brand-gray normal-case tracking-normal font-sans text-sm">
										PDF only, max 20MB each.
									</span>
								)}
							</div>
							<div className="space-y-2">
								{form.workSampleDocumentUrls.length === 0 ? (
									<p className="text-brand-gray text-sm normal-case tracking-normal font-sans max-w-none">
										No work sample PDF uploaded yet.
									</p>
								) : (
									form.workSampleDocumentUrls.map((url) => (
										<div
											key={url}
											className="flex items-center justify-between gap-3 border border-brand-dark px-3 py-2"
										>
											<a
												href={url}
												target="_blank"
												rel="noreferrer"
												className="text-brand-light normal-case tracking-normal font-sans text-sm truncate hover:text-brand-primary"
											>
												{getDocumentName(url)}
											</a>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeDocument("work-sample", url)}
												className="text-red-300 hover:text-red-200"
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									))
								)}
							</div>
						</div>
						<div>
							<label
								htmlFor={`${formId}-proof-summary`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								What did you build? (context, constraints, your direct
								contribution)
							</label>
							<Textarea
								id={`${formId}-proof-summary`}
								value={form.proofOfWorkSummary}
								onChange={(event) =>
									updateField("proofOfWorkSummary", event.target.value)
								}
								placeholder="Describe your strongest proof of work in concrete terms."
								className="min-h-36"
							/>
						</div>
						<div className="border border-brand-dark bg-brand-bg p-4">
							<div className="flex items-start gap-2">
								<Upload className="w-4 h-4 text-brand-primary mt-0.5" />
								<p className="text-brand-gray text-sm normal-case tracking-normal font-sans max-w-none">
									Please do not upload a traditional CV as your main artifact.
									We prioritize tangible build evidence and direct project
									output.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="border border-brand-dark bg-brand-surface p-6 md:p-8">
					<h2 className="mb-5">Your Story</h2>
					<div className="space-y-4">
						<div>
							<label
								htmlFor={`${formId}-biggest-achievement`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Most impressive thing you have done
							</label>
							<Textarea
								id={`${formId}-biggest-achievement`}
								value={form.biggestAchievement}
								onChange={(event) =>
									updateField("biggestAchievement", event.target.value)
								}
								placeholder="What was the challenge, what did you do, and what outcome did you drive?"
								className="min-h-36"
							/>
						</div>
						<div>
							<label
								htmlFor={`${formId}-why-sparkmate`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Why Sparkmate?
							</label>
							<Textarea
								id={`${formId}-why-sparkmate`}
								value={form.whySparkmate}
								onChange={(event) =>
									updateField("whySparkmate", event.target.value)
								}
								placeholder="Why do you want to build this mission with us?"
								className="min-h-32"
							/>
						</div>
						<div>
							<label
								htmlFor={`${formId}-build-strengths`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Build strengths (comma separated, optional)
							</label>
							<Input
								id={`${formId}-build-strengths`}
								value={form.buildStrengthsText}
								onChange={(event) =>
									updateField("buildStrengthsText", event.target.value)
								}
								placeholder="robotics, embedded systems, controls, CAD, manufacturing..."
							/>
						</div>
					</div>
				</section>

				<section className="border border-brand-dark bg-brand-surface p-6 md:p-8">
					<h2 className="mb-5">Interview Logistics</h2>
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor={`${formId}-linkedin`}
									className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
								>
									LinkedIn URL (optional)
								</label>
								<Input
									id={`${formId}-linkedin`}
									value={form.linkedinUrl}
									onChange={(event) =>
										updateField("linkedinUrl", event.target.value)
									}
									placeholder="https://linkedin.com/in/..."
								/>
							</div>
							<div>
								<label
									htmlFor={`${formId}-github`}
									className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
								>
									GitHub URL (optional)
								</label>
								<Input
									id={`${formId}-github`}
									value={form.githubUrl}
									onChange={(event) =>
										updateField("githubUrl", event.target.value)
									}
									placeholder="https://github.com/..."
								/>
							</div>
							<div>
								<label
									htmlFor={`${formId}-earliest-start`}
									className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
								>
									Earliest start date (optional)
								</label>
								<Input
									id={`${formId}-earliest-start`}
									value={form.earliestStartDate}
									onChange={(event) =>
										updateField("earliestStartDate", event.target.value)
									}
									placeholder="Example: June 2026"
								/>
							</div>
							<div className="flex items-end">
								<label className="flex items-center gap-3 text-brand-light text-sm normal-case tracking-normal font-sans font-medium">
									<input
										type="checkbox"
										checked={form.canAttendHongKongOnsite}
										onChange={(event) =>
											updateField(
												"canAttendHongKongOnsite",
												event.target.checked,
											)
										}
										className="h-4 w-4 border border-brand-dark bg-brand-bg"
									/>
									I can attend a one-day in-person technical test in Hong Kong
									if I reach that stage.
								</label>
							</div>
						</div>
						<div>
							<label
								htmlFor={`${formId}-interview-availability`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Interview availability windows
							</label>
							<Textarea
								id={`${formId}-interview-availability`}
								value={form.interviewAvailability}
								onChange={(event) =>
									updateField("interviewAvailability", event.target.value)
								}
								placeholder="Share days/hours that usually work for you."
								className="min-h-24"
							/>
						</div>
						<div>
							<label
								htmlFor={`${formId}-additional-context`}
								className="text-brand-light text-sm mb-2 block normal-case tracking-normal font-sans font-medium"
							>
								Anything else we should know? (optional)
							</label>
							<Textarea
								id={`${formId}-additional-context`}
								value={form.additionalContext}
								onChange={(event) =>
									updateField("additionalContext", event.target.value)
								}
								placeholder="Additional context, constraints, or notes."
								className="min-h-24"
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
							<>
								<Save className="w-4 h-4 mr-2" />
								Save Candidate Profile
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
