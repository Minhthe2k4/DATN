import React, { useState } from 'react'

export function MultipleChoiceQuestion({ question, onAnswer }) {
	const [selected, setSelected] = useState(null)
	const [confirmed, setConfirmed] = useState(false)

	const getChoiceClass = (choice) => {
		let cls = 'vtest-choice'
		if (confirmed) {
			if (choice === question.correct) cls += ' vtest-choice--correct'
			else if (choice === selected && choice !== question.correct) cls += ' vtest-choice--wrong'
		} else if (choice === selected) {
			cls += ' vtest-choice--selected'
		}
		return cls
	}

	const handleChoiceSelect = (choice) => {
		if (confirmed) return
		setSelected(choice)
		setConfirmed(true)
		onAnswer({
			isCorrect: choice === question.correct,
			word: question.correct,
			selectedAnswer: choice,
			correctAnswer: question.correct,
		})
	}

	return (
		<div className="vtest-question">
			<div className="vtest-question__lang-badge">
				{question.lang === 'vi' ? '🇻🇳 Vietnamese → English' : '🇬🇧 English → English'}
			</div>
			<p className="vtest-question__prompt">Từ nào ứng với nghĩa sau?</p>
			<div className="vtest-definition-box">
				<p>{question.definition}</p>
			</div>

			<div className="vtest-choices">
				{question.choices.map((choice) => (
					<button
						key={choice}
						type="button"
						className={getChoiceClass(choice)}
						disabled={confirmed}
						onClick={() => handleChoiceSelect(choice)}
					>
						{choice}
					</button>
				))}
			</div>
		</div>
	)
}
