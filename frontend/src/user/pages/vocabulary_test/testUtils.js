export const TYPE_ARRAY = ['multiple-choice', 'true-false', 'fill-blank']

export function shuffle(arr) {
	return [...arr].sort(() => Math.random() - 0.5)
}

export const TYPE_LABELS = {
	'multiple-choice': 'Multiple Choice',
	'true-false': 'True / False',
	'fill-blank': 'Fill in the Blank',
	'matching': 'Match the Pairs',
}

export const WORD_DETAILS = {}

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

export function generateQuestions(vocabItems, pool) {
	const distractorPool = pool || []

	return vocabItems.map((item, idx) => {
		const type = TYPE_ARRAY[idx % TYPE_ARRAY.length]
		
		if (type === 'multiple-choice') {
			const distractors = distractorPool
				.filter(v => v.word !== item.word)
				.map(v => v.word)
				.sort(() => 0.5 - Math.random())
				.slice(0, 3)
			
			while (distractors.length < 3) {
				distractors.push("Unknown " + distractors.length)
			}
			
			return {
				id: `q-${idx}`,
				type: 'multiple-choice',
				definition: item.meaningVi || item.meaningEn,
				correct: item.word,
				choices: shuffle([item.word, ...distractors]),
				lang: 'vi',
				itemMetadata: item
			}
		} else if (type === 'true-false') {
			const isCorrectChoice = Math.random() > 0.5
			let displayDef = item.meaningVi
			if (!isCorrectChoice) {
				const other = distractorPool.find(v => v.word !== item.word) || vocabItems.find(v => v.word !== item.word)
				displayDef = other ? (other.meaningVi || other.meaningEn) : "A different meaning"
			}
			return {
				id: `q-${idx}`,
				type: 'true-false',
				word: item.word,
				definition: displayDef,
				isCorrect: isCorrectChoice,
				itemMetadata: item
			}
		} else {
			const sentence = item.example || "I like to study ___ every day."
			const parts = sentence.toLowerCase().includes(item.word.toLowerCase()) 
				? sentence.replace(new RegExp(item.word, 'gi'), '___')
				: sentence + " (___)"
			
			const distractors = distractorPool
				.filter(v => v.word !== item.word)
				.map(v => v.word)
				.sort(() => 0.5 - Math.random())
				.slice(0, 3)

			while (distractors.length < 3) {
				distractors.push("Unknown " + distractors.length)
			}

			return {
				id: `q-${idx}`,
				type: 'fill-blank',
				sentence: parts,
				correct: item.word,
				choices: shuffle([item.word, ...distractors]),
				itemMetadata: item
			}
		}
	})
}

export function getWordDetails(word) {
	if (!word) {
		return null
	}

	const normalizedWord = String(word).trim().toLowerCase()
	const knownDetails = WORD_DETAILS[normalizedWord]

	if (knownDetails) {
		return {
			word: normalizedWord,
			...knownDetails,
		}
	}

	return {
		word: normalizedWord,
		pronunciation: '/.../',
		meaningEn: 'No definition available yet.',
		meaningVi: 'Chua co nghia cho tu nay.',
		example: `Example: ${normalizedWord}`,
	}
}
