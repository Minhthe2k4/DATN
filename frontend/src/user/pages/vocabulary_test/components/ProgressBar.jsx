import React from 'react'
import { TYPE_LABELS } from '../testUtils'

export function ProgressBar({ questions, currentIndex, answers }) {
	const pct = Math.round(((currentIndex) / questions.length) * 100)

	return (
		<div className="vtest-progress">
			<div className="vtest-progress__top">
				<span className="vtest-progress__label">Câu hỏi {currentIndex + 1} / {questions.length}</span>
				<span className="vtest-progress__type">{TYPE_LABELS[questions[currentIndex]?.type]}</span>
			</div>
			<div className="vtest-progress__track">
				<div className="vtest-progress__fill" style={{ width: `${pct}%` }} />
			</div>
			<div className="vtest-progress__dots">
				{questions.map((q, i) => {
					const ans = answers[i]
					let status = 'upcoming'
					if (ans === true) status = 'correct'
					else if (ans === false) status = 'wrong'
					else if (i === currentIndex) status = 'current'
					return <div key={q.id} className={`vtest-dot vtest-dot--${status}`} title={`Q${i + 1}`} />
				})}
			</div>
		</div>
	)
}
