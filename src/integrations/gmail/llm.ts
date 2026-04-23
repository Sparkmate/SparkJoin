import { GoogleGenAI } from "@google/genai";
import z from "zod";

export const EXISTING_CANDIDATE_ANALYSIS_SCHEMA = z.object({
	shortSummary: z.string().trim().min(1).max(2000),
	candidateUpdates: z
		.object({
			proofOfWorkSummary: z.string().trim().max(5000).nullable().optional(),
			biggestAchievement: z.string().trim().max(5000).nullable().optional(),
			whySparkmate: z.string().trim().max(5000).nullable().optional(),
			note: z.string().trim().max(5000).nullable().optional(),
		})
		.optional(),
	stepUpdate: z
		.object({
			stepKey: z.string().trim().min(1),
			status: z.enum(["pending", "done", "blocked", "failed"]).default("done"),
			note: z.string().trim().max(5000).nullable().optional(),
		})
		.nullable()
		.optional(),
});

export const UNKNOWN_CANDIDATE_ANALYSIS_SCHEMA = z.object({
	isHiringRelated: z.boolean(),
	shortSummary: z.string().trim().max(2000).nullable().optional(),
	reason: z.string().trim().max(2000).nullable().optional(),
	candidateDraft: z
		.object({
			fullName: z.string().trim().max(140).nullable().optional(),
			preferredName: z.string().trim().max(140).nullable().optional(),
			phone: z.string().trim().max(280).nullable().optional(),
			currentLocation: z.string().trim().max(280).nullable().optional(),
			position: z.string().trim().max(280).nullable().optional(),
			links: z.array(z.string().trim().max(2000)).max(20).optional(),
			proofOfWorkSummary: z.string().trim().max(5000).nullable().optional(),
			biggestAchievement: z.string().trim().max(5000).nullable().optional(),
			whySparkmate: z.string().trim().max(5000).nullable().optional(),
			note: z.string().trim().max(5000).nullable().optional(),
		})
		.nullable()
		.optional(),
});

export function getGeminiClient(): GoogleGenAI | null {
	const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
	if (!apiKey) return null;
	return new GoogleGenAI({ apiKey });
}

export async function generateAndParseJson<T extends z.ZodTypeAny>(
	ai: GoogleGenAI,
	prompt: string,
	schema: T,
): Promise<z.infer<T> | null> {
	try {
		const response = await ai.models.generateContent({
			model: "gemini-3.1-pro",
			contents: prompt,
		});

		const rawText = response.text;
		if (!rawText) return null;

		const parsedJson = tryParseJson(rawText);
		if (!parsedJson) return null;

		const validated = schema.safeParse(parsedJson);
		if (!validated.success) {
			console.error("gmail-webhook-llm-invalid-json-shape", {
				error: validated.error.flatten(),
				rawText,
			});
			return null;
		}

		return validated.data;
	} catch (error) {
		console.error("gmail-webhook-llm-call-failed", { error });
		return null;
	}
}

function tryParseJson(rawText: string): unknown | null {
	try {
		return JSON.parse(rawText);
	} catch {
		const fenced = rawText.match(/```json\s*([\s\S]*?)\s*```/i);
		if (fenced?.[1]) {
			try {
				return JSON.parse(fenced[1]);
			} catch {
				return null;
			}
		}
		return null;
	}
}
