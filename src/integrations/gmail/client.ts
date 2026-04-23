import { google } from "googleapis";
import type { GmailMessageSnapshot, GmailPushData } from "./types";

const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const DEFAULT_GMAIL_DWD_SERVICE_ACCOUNT =
	"gmail-webhook-dwd@sparkmate-tribe.iam.gserviceaccount.com";

interface GmailMessagePart {
	mimeType?: string | null;
	body?: { data?: string | null };
	parts?: GmailMessagePart[];
}

export async function fetchLatestGmailMessageSnapshot(
	pushData: GmailPushData,
): Promise<GmailMessageSnapshot> {
	const empty: GmailMessageSnapshot = {
		gmailMessageId: null,
		sender: null,
		receiver: null,
		cc: null,
		bcc: null,
		body: null,
	};

	const privateKey = getServiceAccountPrivateKey();
	if (!privateKey) {
		console.warn("gmail-webhook-service-account-missing-private-key", {
			requiredEnv: "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
			serviceAccount: getServiceAccountEmail(),
		});
		return empty;
	}

	try {
		const jwtClient = new google.auth.JWT({
			email: getServiceAccountEmail(),
			key: privateKey,
			scopes: [GMAIL_READONLY_SCOPE],
			subject: pushData.emailAddress,
		});
		const gmail = google.gmail({ version: "v1", auth: jwtClient });
		const historyResponse = await gmail.users.history.list({
			userId: "me",
			startHistoryId: pushData.historyId,
			historyTypes: ["messageAdded"],
			maxResults: 10,
		});

		const latestMessageId =
			historyResponse.data.history
				?.flatMap((entry) => entry.messagesAdded ?? [])
				.map((entry) => entry.message?.id)
				.filter((id): id is string => Boolean(id))
				.at(-1) ?? null;

		if (!latestMessageId) return empty;

		const messageResponse = await gmail.users.messages.get({
			userId: "me",
			id: latestMessageId,
			format: "full",
		});

		const payload = messageResponse.data.payload;
		return {
			gmailMessageId: latestMessageId,
			sender: getHeaderValue(payload?.headers, "From"),
			receiver: getHeaderValue(payload?.headers, "To"),
			cc: getHeaderValue(payload?.headers, "Cc"),
			bcc: getHeaderValue(payload?.headers, "Bcc"),
			body:
				decodeBase64Url(payload?.body?.data) ??
				extractTextBody(payload?.parts as GmailMessagePart[] | undefined),
		};
	} catch (error) {
		if (isUnauthorizedClientError(error)) {
			console.error("gmail-webhook-service-account-unauthorized", {
				serviceAccount: getServiceAccountEmail(),
				subjectUser: pushData.emailAddress,
				scope: GMAIL_READONLY_SCOPE,
				hint: "Authorize this service account client ID for Gmail scope in Google Workspace Admin domain-wide delegation.",
			});
		} else {
			console.error("gmail-webhook-fetch-failed", {
				serviceAccount: getServiceAccountEmail(),
				subjectUser: pushData.emailAddress,
				error,
			});
		}
		return empty;
	}
}

function decodeBase64Url(data?: string | null): string | null {
	if (!data) return null;
	const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
	const padded = normalized.padEnd(
		normalized.length + ((4 - (normalized.length % 4)) % 4),
		"=",
	);
	return Buffer.from(padded, "base64").toString("utf8");
}

function getHeaderValue(
	headers: Array<{ name?: string | null; value?: string | null }> | undefined,
	name: string,
): string | null {
	if (!headers) return null;
	const header = headers.find(
		(item) => item.name?.toLowerCase() === name.toLowerCase(),
	);
	return header?.value?.trim() || null;
}

function extractTextBody(parts: GmailMessagePart[] | undefined): string | null {
	if (!parts || parts.length === 0) return null;

	for (const part of parts) {
		if (part.mimeType === "text/plain") {
			const decoded = decodeBase64Url(part.body?.data ?? null);
			if (decoded) return decoded;
		}
	}

	for (const part of parts) {
		const nested = extractTextBody(part.parts);
		if (nested) return nested;
	}

	return null;
}

function getServiceAccountPrivateKey(): string | null {
	const raw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
	if (!raw) return null;
	return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

function getServiceAccountEmail(): string {
	return (
		process.env.GMAIL_SERVICE_ACCOUNT_EMAIL ||
		process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
		DEFAULT_GMAIL_DWD_SERVICE_ACCOUNT
	);
}

function isUnauthorizedClientError(error: unknown): boolean {
	const maybeError = error as {
		message?: string;
		cause?: { message?: string };
	};
	return (
		maybeError?.message?.includes("unauthorized_client") === true ||
		maybeError?.cause?.message?.includes("unauthorized_client") === true
	);
}
