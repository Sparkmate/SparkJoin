export function hasValue(value: string | null | undefined): boolean {
	return Boolean(value && value.trim().length > 0);
}

export function toNullable(value: string | null | undefined): string | null {
	if (!hasValue(value)) return null;
	return value?.trim() ?? null;
}

export function normalizeLinks(values: string[]): string[] {
	return Array.from(
		new Set(values.map((item) => item.trim()).filter((item) => item.length > 0)),
	);
}

export function appendNote(
	existing: string | null,
	incoming: string | null | undefined,
): string {
	const incomingText = incoming?.trim();
	if (!incomingText) return existing ?? "";
	if (!existing?.trim()) return incomingText;
	if (existing.includes(incomingText)) return existing;
	return `${existing}\n\n[Email ingestion] ${incomingText}`;
}
