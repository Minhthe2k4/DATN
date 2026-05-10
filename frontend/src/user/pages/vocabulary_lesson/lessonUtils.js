export function getHintPositions(word) {
	if (word.length <= 4) {
		return [0]
	}
	return [0, word.length - 1]
}

export function playWordAudio(word) {
	if (!('speechSynthesis' in window)) {
		return
	}

	window.speechSynthesis.cancel()
	const utterance = new window.SpeechSynthesisUtterance(word)
	utterance.lang = 'en-US'
	utterance.rate = 0.92
	window.speechSynthesis.speak(utterance)
}
