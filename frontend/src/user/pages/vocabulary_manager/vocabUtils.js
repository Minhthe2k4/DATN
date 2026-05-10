export const KNOWN_WORDS = {
	platform: {
		pronunciation: '/ˈplæt.fɔːrm/',
		meaningEn: 'A base or place where people can do a specific activity.',
		meaningVi: 'Nền tảng hoặc nơi để thực hiện một hoạt động cụ thể.',
		example: 'This app is a learning platform for daily English practice.',
	},
	efficient: {
		pronunciation: '/ɪˈfɪʃ.ənt/',
		meaningEn: 'Working well without wasting time or energy.',
		meaningVi: 'Hiệu quả, không lãng phí thời gian hoặc năng lượng.',
		example: 'A short review routine can be very efficient.',
	},
	adapt: {
		pronunciation: '/əˈdæpt/',
		meaningEn: 'To change your behavior or method to fit a new situation.',
		meaningVi: 'Thích nghi, điều chỉnh để phù hợp với tình huống mới.',
		example: 'Students adapt quickly when the lesson format changes.',
	},
	innovate: {
		pronunciation: '/ˈɪn.ə.veɪt/',
		meaningEn: 'To introduce new ideas or methods.',
		meaningVi: 'Đổi mới, đưa ra ý tưởng hoặc phương pháp mới.',
		example: 'Great teams innovate when old solutions stop working.',
	},
	collaborate: {
		pronunciation: '/kəˈlæb.ə.reɪt/',
		meaningEn: 'To work together with others.',
		meaningVi: 'Hợp tác, làm việc cùng với người khác.',
		example: 'Designers and developers collaborate on each release.',
	},
}

export function readStorage(STORAGE_KEY) {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		const parsed = raw ? JSON.parse(raw) : []
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

export function writeStorage(STORAGE_KEY, items) {
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function clampLevel(value) {
	return Math.max(1, Math.min(6, value))
}

export function estimateWordLevel(word, meaningEn = '', example = '') {
	const clean = String(word || '').trim().toLowerCase()
	if (!clean) {
		return 1
	}

	let score = 0
	if (clean.length >= 5) score += 1
	if (clean.length >= 8) score += 1
	if (clean.length >= 11) score += 1
	if (/tion$|sion$|ment$|ture$|ship$|ology$/.test(clean)) score += 1
	if ((meaningEn || '').split(' ').length >= 7) score += 1
	if ((example || '').split(' ').length >= 10) score += 1

	return clampLevel(1 + Math.floor(score / 1.2))
}

export function guessPhonetic(word) {
	const base = String(word || '').trim().toLowerCase()
	if (!base) {
		return '/.../'
	}

	return `/${base
		.replace(/tion/g, 'shən')
		.replace(/ph/g, 'f')
		.replace(/th/g, 'θ')
		.replace(/oo/g, 'uː')
		.replace(/ee/g, 'iː')
		.replace(/a([bcdfghjklmnpqrstvwxyz])/g, 'æ$1')
		.replace(/e([bcdfghjklmnpqrstvwxyz])/g, 'e$1')}/`
}

export function fallbackVietnamese(word, meaningEn) {
	if (meaningEn) {
		return `Nghĩa gần đúng của "${word}": ${meaningEn}`
	}

	return `Bản dịch tạm thời cho từ "${word}".`
}

export async function translateToVietnamese(word, meaningEn) {
	const normalized = String(word || '').trim().toLowerCase()
	if (KNOWN_WORDS[normalized]?.meaningVi) {
		return KNOWN_WORDS[normalized].meaningVi
	}

	if (!meaningEn) {
		return fallbackVietnamese(word, '')
	}

	try {
		const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(meaningEn)}&langpair=en|vi`
		const response = await fetch(url)
		if (!response.ok) {
			return fallbackVietnamese(word, meaningEn)
		}

		const data = await response.json()
		const translated = data?.responseData?.translatedText
		if (!translated || translated.toLowerCase() === meaningEn.toLowerCase()) {
			return fallbackVietnamese(word, meaningEn)
		}

		return translated
	} catch {
		return fallbackVietnamese(word, meaningEn)
	}
}

export async function fetchDictionaryProfile(word) {
	const normalized = String(word || '').trim().toLowerCase()
	if (!normalized) {
		return null
	}

	if (KNOWN_WORDS[normalized]) {
		const known = KNOWN_WORDS[normalized]
		return {
			...known,
			level: estimateWordLevel(normalized, known.meaningEn, known.example),
		}
	}

	let pronunciation = guessPhonetic(normalized)
	let meaningEn = `An English vocabulary word: ${normalized}.`
	let example = `The word "${normalized}" appears in this vocabulary note.`

	try {
		const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalized)}`)
		if (response.ok) {
			const data = await response.json()
			const entry = Array.isArray(data) ? data[0] : null
			const phoneticText = entry?.phonetic || entry?.phonetics?.find((item) => item?.text)?.text
			const firstMeaning = entry?.meanings?.[0]?.definitions?.[0]
			if (phoneticText) {
				pronunciation = phoneticText
			}
			if (firstMeaning?.definition) {
				meaningEn = firstMeaning.definition
			}
			if (firstMeaning?.example) {
				example = firstMeaning.example
			}
		}
	} catch {
		// Keep fallbacks when the external dictionary is unavailable.
	}

	const meaningVi = await translateToVietnamese(normalized, meaningEn)
	let exampleVi = ''
	if (example) {
		try {
			const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(example)}&langpair=en|vi`
			const response = await fetch(url)
			if (response.ok) {
				const data = await response.json()
				exampleVi = data?.responseData?.translatedText || ''
			}
		} catch {
			exampleVi = ''
		}
	}

	const level = estimateWordLevel(normalized, meaningEn, example)

	return {
		pronunciation,
		meaningEn,
		meaningVi,
		example,
		exampleVi,
		level,
	}
}

export function playWordAudio(word) {
	if (!word || !('speechSynthesis' in window)) {
		return
	}

	window.speechSynthesis.cancel()
	const utterance = new window.SpeechSynthesisUtterance(word)
	utterance.lang = 'en-US'
	utterance.rate = 0.9
	window.speechSynthesis.speak(utterance)
}

export function createRow() {
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		word: '',
		pronunciation: '',
		meaningEn: '',
		meaningVi: '',
		example: '',
		exampleVi: '',
		showExample: false,
		level: '',
		status: 'idle',
		error: '',
	}
}

export function createSavedItem(row) {
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		word: row.word.trim(),
		pronunciation: row.pronunciation,
		meaningEn: row.meaningEn,
		meaningVi: row.meaningVi,
		example: row.example,
		exampleVi: row.exampleVi,
		level: row.level,
		levelSource: 'AI',
	}
}

export function getDelimiterValue(mode, customValue, defaults) {
	if (mode === 'tab') return '\t'
	if (mode === 'comma') return ','
	if (mode === 'newline') return '\n'
	if (mode === 'semicolon') return ';'
	if (mode === 'custom') return customValue || defaults
	return defaults
}

export function parseImportText(text, termMode, termCustom, cardMode, cardCustom) {
	const cardDelimiter = getDelimiterValue(cardMode, cardCustom, '\n')
	const termDelimiter = getDelimiterValue(termMode, termCustom, '\t')
	const rawCards = text
		.split(cardDelimiter)
		.map((item) => item.trim())
		.filter(Boolean)

	return rawCards.map((card, index) => {
		const parts = card.split(termDelimiter)
		return {
			id: `preview-${index}`,
			word: (parts[0] || '').trim(),
			definition: parts.slice(1).join(termDelimiter).trim(),
		}
	}).filter((item) => item.word)
}
