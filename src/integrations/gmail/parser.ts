import type {
	CandidateEmail,
	GmailMessageSnapshot,
	GmailPushData,
} from "./types";

const INTERNAL_DOMAIN = "sparkmate.com";

export function decodePubSubMessageData(encodedData?: string): GmailPushData | null {
	if (!encodedData) return null;

	try {
		const decoded = Buffer.from(encodedData, "base64").toString("utf8");
		return JSON.parse(decoded) as GmailPushData;
	} catch {
		return null;
	}
}

export function collectCandidateEmails(
	message: GmailMessageSnapshot,
): CandidateEmail[] {
	const senderEmails = extractEmailsFromHeader(message.sender);
	const receiverEmails = extractEmailsFromHeader(message.receiver);
	const ccEmails = extractEmailsFromHeader(message.cc);
	const bccEmails = extractEmailsFromHeader(message.bcc);
	const recipientEmails = [...receiverEmails, ...ccEmails, ...bccEmails];

	const inboundCandidateEmails = senderEmails
		.filter((email) => !isInternalEmail(email))
		.map((email) => ({ email, direction: "inbound" as const }));

	const outboundCandidateEmails = recipientEmails
		.filter((email) => !isInternalEmail(email))
		.map((email) => ({ email, direction: "outbound" as const }));

	return [...inboundCandidateEmails, ...outboundCandidateEmails].filter(
		(item, index, all) =>
			all.findIndex(
				(other) =>
					other.email === item.email && other.direction === item.direction,
			) === index,
	);
}

function extractEmailsFromHeader(headerValue: string | null): string[] {
	if (!headerValue) return [];
	const matches = headerValue.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
	return (matches ?? []).map((email) => email.toLowerCase());
}

function isInternalEmail(email: string): boolean {
	return email.endsWith(`@${INTERNAL_DOMAIN}`);
}
