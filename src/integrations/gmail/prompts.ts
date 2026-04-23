import type { GmailMessageSnapshot } from "./types";

type CandidateEmail = { email: string; direction: "inbound" | "outbound" };

export function buildExistingCandidatePrompt({
	candidateEmail,
	message,
	candidateContext,
	hiringContext,
}: {
	candidateEmail: CandidateEmail;
	message: GmailMessageSnapshot;
	candidateContext: Record<string, unknown>;
	hiringContext: Record<string, unknown>;
}): string {
	return [
		"You are an assistant helping ingest hiring-related email interactions.",
		"Return JSON only.",
		"",
		"Email metadata:",
		JSON.stringify(
			{
				direction: candidateEmail.direction,
				candidateEmail: candidateEmail.email,
				messageId: message.gmailMessageId,
				sender: message.sender,
				to: message.receiver,
				cc: message.cc,
				bcc: message.bcc,
				body: message.body ?? "",
			},
			null,
			2,
		),
		"",
		"Candidate current context:",
		JSON.stringify(candidateContext, null, 2),
		"",
		"Hiring steps context:",
		JSON.stringify(hiringContext, null, 2),
		"",
		"Need JSON keys:",
		`{
  "shortSummary": "short useful summary of this interaction",
  "candidateUpdates": {
    "proofOfWorkSummary": "nullable string",
    "biggestAchievement": "nullable string",
    "whySparkmate": "nullable string",
    "note": "nullable string"
  },
  "stepUpdate": {
    "stepKey": "existing step key from context",
    "status": "pending|done|blocked|failed",
    "note": "nullable string"
  }
}`,
		"",
		"Rules:",
		"- Always set shortSummary.",
		"- Only suggest candidateUpdates fields when they are present in the email.",
		"- Prefer updating only missing fields (proofOfWorkSummary, biggestAchievement, whySparkmate).",
		"- stepUpdate is optional and must use an existing step key.",
	].join("\n");
}

export function buildUnknownCandidatePrompt({
	candidateEmail,
	message,
}: {
	candidateEmail: CandidateEmail;
	message: GmailMessageSnapshot;
}): string {
	return [
		"You are triaging an incoming or outgoing email for hiring ingestion.",
		"Return JSON only.",
		"",
		"Email metadata:",
		JSON.stringify(
			{
				direction: candidateEmail.direction,
				candidateEmail: candidateEmail.email,
				messageId: message.gmailMessageId,
				sender: message.sender,
				to: message.receiver,
				cc: message.cc,
				bcc: message.bcc,
				body: message.body ?? "",
			},
			null,
			2,
		),
		"",
		"Candidate schema context for extracting useful fields:",
		JSON.stringify(
			{
				fullName: "string",
				preferredName: "string|null",
				phone: "string|null",
				currentLocation: "string|null",
				position: "string",
				links: "string[]",
				proofOfWorkSummary: "string|null",
				biggestAchievement: "string|null",
				whySparkmate: "string|null",
				note: "string|null",
			},
			null,
			2,
		),
		"",
		"Need JSON keys:",
		`{
  "isHiringRelated": true|false,
  "shortSummary": "nullable string",
  "reason": "nullable short explanation",
  "candidateDraft": {
    "fullName": "nullable string",
    "preferredName": "nullable string",
    "phone": "nullable string",
    "currentLocation": "nullable string",
    "position": "nullable string",
    "links": ["url strings"],
    "proofOfWorkSummary": "nullable string",
    "biggestAchievement": "nullable string",
    "whySparkmate": "nullable string",
    "note": "nullable string"
  }
}`,
		"",
		"Rules:",
		"- If this is unrelated to hiring/candidacy, set isHiringRelated=false.",
		"- If hiring-related, fill candidateDraft with any reliable details from the email.",
	].join("\n");
}
