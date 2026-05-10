import React, { useEffect } from 'react'
import { playWordAudio } from '../testUtils'

export function AnswerWordPopup({ data, onNext }) {
	useEffect(() => {
		if (!data?.details?.word) {
			return
		}

		playWordAudio(data.details.word)
	}, [data])

	if (!data?.details) {
		return null
	}

	const { isCorrect, details } = data

	return (
		<div className="vtest-word-popup-wrap" aria-live="polite">
			<div className={`vtest-word-popup ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
				<div className="vtest-word-popup__head">
					<div className={`vtest-word-popup__badge ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
						{isCorrect ? 'Correct' : 'Incorrect'}
					</div>
				</div>

				<div className="vtest-word-popup__word-row">
					<div>
						<h3 className="vtest-word-popup__word">{details.word}</h3>
						<p className="vtest-word-popup__phonetic">{details.pronunciation}</p>
					</div>
					<button
						type="button"
						className="vtest-word-popup__audio"
						onClick={() => playWordAudio(details.word)}
					>
						Phát Audio
					</button>
				</div>

				<div className="vtest-word-popup__content">
					<p><strong>Nghĩa tiếng Anh:</strong> {details.meaningEn}</p>
					<p><strong>Nghĩa tiếng Việt:</strong> {details.meaningVi}</p>
					<p><strong>Ví dụ:</strong> {details.example}</p>
				</div>

				<div className="vtest-word-popup__footer">
					<button type="button" className="vtest-btn vtest-btn--next" onClick={onNext}>
						Tiếp theo →
					</button>
				</div>
			</div>
		</div>
	)
}
