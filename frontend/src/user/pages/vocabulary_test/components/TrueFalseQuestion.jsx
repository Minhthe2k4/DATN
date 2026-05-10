import React, { useState } from 'react'
import { Check, X } from 'lucide-react'

export function TrueFalseQuestion({ question, onAnswer }) {
	const [selected, setSelected] = useState(null)
	const [confirmed, setConfirmed] = useState(false)

	const handleSelect = (value) => {
		if (confirmed) return
		setSelected(value)
		setConfirmed(true)
		onAnswer({
			isCorrect: value === question.isCorrect,
			word: question.word,
			selectedAnswer: value ? 'Đúng' : 'Sai',
			correctAnswer: question.isCorrect ? 'Đúng' : 'Sai',
		})
	}

	const getTrueBtnClass = () => {
		let cls = 'vtest-tf-btn vtest-tf-btn--true'
		if (confirmed) {
			if (question.isCorrect === true) cls += ' is-correct'
			else if (selected === true) cls += ' is-wrong'
		}
		return cls
	}

	const getFalseBtnClass = () => {
		let cls = 'vtest-tf-btn vtest-tf-btn--false'
		if (confirmed) {
			if (question.isCorrect === false) cls += ' is-correct'
			else if (selected === false) cls += ' is-wrong'
		}
		return cls
	}

	return (
		<div className="vtest-question">
			<p className="vtest-question__prompt">Định nghĩa này có đúng với từ không?</p>
			<div className="vtest-tf-card">
				<span className="vtest-tf-card__word">{question.word}</span>
				<span className="vtest-tf-card__arrow">→</span>
				<span className="vtest-tf-card__def">"{question.definition}"</span>
			</div>

			<div className="vtest-tf-choices">
				<button type="button" className={getTrueBtnClass()} disabled={confirmed} onClick={() => handleSelect(true)}>
					<Check size={28} className="vtest-tf-icon" />
					Đúng
				</button>
				<button type="button" className={getFalseBtnClass()} disabled={confirmed} onClick={() => handleSelect(false)}>
					<X size={28} className="vtest-tf-icon" />
					Sai
				</button>
			</div>

		</div>
	)
}
