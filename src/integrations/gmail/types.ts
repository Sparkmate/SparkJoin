export interface PubSubPushBody {
	message?: {
		data?: string;
		messageId?: string;
		publishTime?: string;
		attributes?: Record<string, string>;
	};
	subscription?: string;
}

export interface GmailPushData {
	emailAddress?: string;
	historyId?: string;
}

export interface CandidateEmail {
	email: string;
	direction: "inbound" | "outbound";
}

export interface GmailMessageSnapshot {
	gmailMessageId: string | null;
	sender: string | null;
	receiver: string | null;
	cc: string | null;
	bcc: string | null;
	body: string | null;
}
