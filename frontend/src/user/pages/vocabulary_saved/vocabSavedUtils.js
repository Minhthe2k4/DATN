export const STORAGE_KEY = 'dashboard-vocab-bank-v1'

export function readSavedVocabulary() {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		const parsed = raw ? JSON.parse(raw) : []
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

export function writeSavedVocabulary(items) {
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function normalizeLevel(level) {
	const numeric = Number(level)
	if (!Number.isFinite(numeric)) {
		return 1
	}
	return Math.max(1, Math.min(6, Math.round(numeric)))
}
