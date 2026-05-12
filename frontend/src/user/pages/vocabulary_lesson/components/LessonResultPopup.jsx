import React, { useEffect } from 'react'
import { Volume2, ArrowRight } from 'lucide-react'
import { playWordAudio } from '../lessonUtils'

export function LessonResultPopup({ data, onNext }) {
	useEffect(() => {
		if (data?.details?.word) {
			playWordAudio(data.details.word)
		}
	}, [data])

	if (!data?.details) return null

	const { isCorrect, details } = data

	return (
		<div className="vtest-word-popup-wrap" aria-live="polite">
			<div className={`vtest-word-popup ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
				<div className="vtest-word-popup__head">
					<div className={`vtest-word-popup__badge ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
						{isCorrect ? 'Chính xác' : 'Chưa chính xác'}
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
						<Volume2 size={16} style={{ marginRight: '6px' }} />
						Phát Audio
					</button>
				</div>

				<div className="vtest-word-popup__content">
					<p><strong>EN:</strong> {details.meaningEn}</p>
					<p><strong>VI:</strong> {details.meaningVi}</p>
					<div className="vtest-word-popup__example-box">
						<p><strong>Ví dụ:</strong> {details.example}</p>
						{details.exampleVi && (
							<p className="vtest-word-popup__example-vi"><em>({details.exampleVi})</em></p>
						)}
					</div>
				</div>

				<div className="vtest-word-popup__footer">
					<button type="button" className="vtest-btn vtest-btn--next" onClick={onNext}>
						Tiếp theo <ArrowRight size={18} style={{ marginLeft: '8px' }} />
					</button>
				</div>
			</div>
		</div>
	)
}
