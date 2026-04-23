import { createFileRoute } from "@tanstack/react-router";

interface PubSubPushBody {
	message?: {
		data?: string;
		messageId?: string;
		publishTime?: string;
		attributes?: Record<string, string>;
	};
	subscription?: string;
}

interface GmailPushData {
	emailAddress?: string;
	historyId?: string;
}

function decodePubSubMessageData(encodedData?: string): GmailPushData | null {
	if (!encodedData) return null;

	try {
		const decoded = Buffer.from(encodedData, "base64").toString("utf8");
		return JSON.parse(decoded) as GmailPushData;
	} catch {
		return null;
	}
}

export const Route = createFileRoute("/api/webhooks/gmail")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				let payload: PubSubPushBody;

				try {
					payload = (await request.json()) as PubSubPushBody;
				} catch {
					return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
				}

				if (!payload?.message?.data) {
					return Response.json(
						{ error: "Missing Pub/Sub message data" },
						{ status: 400 },
					);
				}

				const gmailData = decodePubSubMessageData(payload.message.data);
				if (!gmailData?.emailAddress || !gmailData?.historyId) {
					return Response.json(
						{ error: "Invalid Gmail Pub/Sub message payload" },
						{ status: 400 },
					);
				}

				// Keep this handler fast to avoid Pub/Sub retries; enqueue async work here later.
				console.info("gmail-webhook-received", {
					subscription: payload.subscription,
					messageId: payload.message.messageId,
					publishTime: payload.message.publishTime,
					emailAddress: gmailData.emailAddress,
					historyId: gmailData.historyId,
				});

				return new Response(null, { status: 204 });
			},
		},
	},
});
