import React, { useState } from 'react'
import { shuffle } from '../testUtils'

export function MatchingQuestion({ question, onAnswer }) {
	const [shuffledDefs] = useState(() => shuffle(question.pairs.map((p) => p.definition)))
	const [selectedWord, setSelectedWord] = useState(null)
	const [matched, setMatched] = useState({})
	const [wrongPair, setWrongPair] = useState(null)

	const allMatched = Object.keys(matched).length === question.pairs.length

	const handleWordClick = (word) => {
		if (matched[word]) return
		setSelectedWord((prev) => (prev === word ? null : word))
	}

	const handleDefClick = (def) => {
		if (!selectedWord) return
		if (Object.values(matched).includes(def)) return

		const correctDef = question.pairs.find((p) => p.word === selectedWord)?.definition
		if (def === correctDef) {
			setMatched((prev) => ({ ...prev, [selectedWord]: def }))
			setSelectedWord(null)
		} else {
			setWrongPair({ word: selectedWord, def })
			setTimeout(() => {
				setWrongPair(null)
				setSelectedWord(null)
			}, 700)
		}
	}

	return (
		<div className="vtest-question">
			<p className="vtest-question__prompt">Chọn một từ, sau đó chọn định nghĩa phù hợp với từ đó.</p>

			<div className="vtest-matching">
				<div className="vtest-matching__col">
					{question.pairs.map(({ word }) => {
						const isMatched = !!matched[word]
						return (
							<button
								key={word}
								type="button"
								className={`vtest-match-card vtest-match-card--word${isMatched ? ' is-matched' : ''}${selectedWord === word ? ' is-selected' : ''}${wrongPair?.word === word ? ' is-wrong' : ''}`}
								onClick={() => handleWordClick(word)}
								disabled={isMatched}
							>
								{word}
								{isMatched && <span className="vtest-match-check">✓</span>}
							</button>
						)
					})}
				</div>

				<div className="vtest-matching__divider">
					{question.pairs.map((_, i) => (
						<div key={i} className="vtest-matching__line" />
					))}
				</div>

				<div className="vtest-matching__col">
					{shuffledDefs.map((def) => {
						const isMatched = Object.values(matched).includes(def)
						return (
							<button
								key={def}
								type="button"
								className={`vtest-match-card vtest-match-card--def${isMatched ? ' is-matched' : ''}${wrongPair?.def === def ? ' is-wrong' : ''}`}
								onClick={() => handleDefClick(def)}
								disabled={isMatched}
							>
								{def}
								{isMatched && <span className="vtest-match-check">✓</span>}
							</button>
						)
					})}
				</div>
			</div>

			{allMatched && (
				<div className="vtest-actions">
					<div className="vtest-feedback">
						<div className="vtest-feedback__banner is-correct">
							✓ Tất cả các cặp đã được nối chính xác!
						</div>
						<button
							type="button"
							className="vtest-btn vtest-btn--next"
							onClick={() => onAnswer({
								isCorrect: true,
								word: null,
								selectedAnswer: 'All pairs matched',
								correctAnswer: 'All pairs matched',
							})}
						>
							Tiếp theo →
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
