import { createFileRoute } from "@tanstack/react-router";
import { put } from "@vercel/blob";
import { auth } from "#/lib/auth";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["application/pdf"]);

function sanitizeFilename(filename: string): string {
	return filename
		.toLowerCase()
		.replace(/[^a-z0-9.-]/g, "-")
		.replace(/-+/g, "-");
}

function getKind(raw: string | null): "portfolio" | "work-sample" {
	return raw === "work-sample" ? "work-sample" : "portfolio";
}

export const Route = createFileRoute("/api/candidate-documents")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const session = await auth.api.getSession({ headers: request.headers });
				if (!session?.user) {
					return new Response("Unauthorized", { status: 401 });
				}

				const formData = await request.formData();
				const fileValue = formData.get("file");
				const kind = getKind(formData.get("kind")?.toString() ?? null);

				if (!(fileValue instanceof File)) {
					return Response.json(
						{ error: "Missing file upload" },
						{ status: 400 },
					);
				}

				if (!ALLOWED_CONTENT_TYPES.has(fileValue.type)) {
					return Response.json(
						{ error: "Only PDF files are accepted" },
						{ status: 400 },
					);
				}

				if (fileValue.size > MAX_FILE_SIZE_BYTES) {
					return Response.json(
						{ error: "PDF is too large (max 20MB)" },
						{ status: 400 },
					);
				}

				const safeFilename = sanitizeFilename(fileValue.name || "document.pdf");
				const key = `candidate-documents/${session.user.id}/${kind}/${Date.now()}-${safeFilename}`;
				const blob = await put(key, fileValue, {
					access: "public",
					addRandomSuffix: false,
					contentType: "application/pdf",
				});

				return Response.json({
					url: blob.url,
					pathname: blob.pathname,
					size: fileValue.size,
					contentType: fileValue.type,
					kind,
				});
			},
		},
	},
});
