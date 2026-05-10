import React, { useState } from 'react'

export function FillBlankQuestion({ question, onAnswer }) {
	const [selected, setSelected] = useState(null)
	const [confirmed, setConfirmed] = useState(false)

	const isCorrect = selected === question.correct
	const parts = question.sentence.split('___')

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
			<p className="vtest-question__prompt">Chọn từ phù hợp để điền vào chỗ trống.</p>
			<div className="vtest-blank__sentence">
				<span>{parts[0]}</span>
				<span className={`vtest-blank__slot${confirmed ? (isCorrect ? ' is-correct' : ' is-wrong') : selected ? ' is-filled' : ''}`}>
					{selected || '_____'}
				</span>
				<span>{parts[1]}</span>
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
