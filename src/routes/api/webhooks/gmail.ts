import { createFileRoute } from "@tanstack/react-router";
import { ingestGmailWebhook } from "#/integrations/gmail/ingestion";
import { getGeminiClient } from "#/integrations/gmail/llm";
import { decodePubSubMessageData } from "#/integrations/gmail/parser";
import type { PubSubPushBody } from "#/integrations/gmail/types";

export const Route = createFileRoute("/api/webhooks/gmail")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				let payload: PubSubPushBody;

				try {
					payload = (await request.json()) as PubSubPushBody;
				} catch {
					return Response.json(
						{ error: "Invalid JSON payload" },
						{ status: 400 },
					);
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

				const ai = getGeminiClient();
				if (!ai) {
					console.warn("gmail-webhook-missing-gemini-api-key", {
						requiredEnv: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
					});
					return new Response(null, { status: 204 });
				}

				await ingestGmailWebhook(gmailData, ai);

				return new Response(null, { status: 204 });
			},
		},
	},
});
