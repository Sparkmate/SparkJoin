export const candidateProcessStageKeys = [
	"application_instructions_sent",
	"application_review",
	"culture_fit_review",
	"first_interview",
	"second_interview_maxime",
	"third_interview_morgan",
	"onsite_technical_test",
	"final_decision",
] as const;

export type CandidateProcessStageKey =
	(typeof candidateProcessStageKeys)[number];

export const candidateProcessOutcomes = [
	"in_progress",
	"rejected",
	"hired",
] as const;

export type CandidateProcessOutcome = (typeof candidateProcessOutcomes)[number];

export type CandidateProcessStageDefinition = {
	key: CandidateProcessStageKey;
	title: string;
	owner: string;
	description: string;
};

export const candidateProcessStages: CandidateProcessStageDefinition[] = [
	{
		key: "application_instructions_sent",
		title: "Application Brief Sent",
		owner: "SparkCrew",
		description:
			"You shared your email and received the ACTION REQUIRED message with what to send next: proof of work, your most impressive achievement, and why Sparkmate.",
	},
	{
		key: "application_review",
		title: "Application Intake Review",
		owner: "SparkCrew + Hiring Team",
		description:
			"Your submission is reviewed to understand what you have actually built. We focus on concrete output and depth of work, not CV formatting.",
	},
	{
		key: "culture_fit_review",
		title: "Culture Fit Scoring",
		owner: "SparkCrew + Morgan + Maxime",
		description:
			"Your story and work are read against how we build at Sparkmate. We summarize this as a team resonance score, then decide whether to start interviews.",
	},
	{
		key: "first_interview",
		title: "Interview 1",
		owner: "Assigned Teammate",
		description:
			"You meet a Sparkmate teammate for a first conversation. We then review their feedback and share your next step quickly.",
	},
	{
		key: "second_interview_maxime",
		title: "Interview 2",
		owner: "Maxime",
		description:
			"If the first interview is positive, you meet Maxime next. That conversation helps determine whether you continue in the process.",
	},
	{
		key: "third_interview_morgan",
		title: "Interview 3",
		owner: "Morgan",
		description:
			"If round two goes well, you meet Morgan. Together with previous feedback, this decides whether you advance to the onsite test day.",
	},
	{
		key: "onsite_technical_test",
		title: "One-Day Onsite Technical Test",
		owner: "Sparkmate Team (Kwai Chung)",
		description:
			"If interviews are strong, we invite you to a one-day in-person technical test in our Kwai Chung office to collaborate on real work.",
	},
	{
		key: "final_decision",
		title: "Final Hiring Decision",
		owner: "Morgan + Maxime",
		description:
			"We bring together feedback from every stage and make a final decision. If it's a yes, you receive your offer and meet Ampy to continue onboarding.",
	},
];
