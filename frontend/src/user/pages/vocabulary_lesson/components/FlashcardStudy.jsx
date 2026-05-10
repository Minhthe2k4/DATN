import React from 'react'
import { Volume2, Check, ArrowRight } from 'lucide-react'
import { playWordAudio } from '../lessonUtils'

export function FlashcardStudy({ 
	word, 
	isFlipped, 
	onFlip, 
	onSkip, 
	onNextStep 
}) {
	return (
		<>
			<div
				role="button"
				tabIndex={0}
				className={`flashcard${isFlipped ? ' is-flipped' : ''}`}
				onClick={onFlip}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onFlip();
					}
				}}
				aria-label="Lat flashcard"
			>
				<div className="flashcard__face flashcard__face--front">
					<div className="flashcard__top">
						<span className="flashcard__tag">Mặt trước</span>
						<button
							type="button"
							className="flashcard__audio-btn"
							onClick={(event) => {
								event.stopPropagation()
								playWordAudio(word.word)
							}}
						>
							<Volume2 size={16} style={{ marginRight: '6px' }} />
							Audio
						</button>
					</div>
					<h2>{word.word}</h2>
					<p className="flashcard__phonetic">{word.phonetic}</p>
					<p className="flashcard__example">{word.example}</p>
					<p className="flashcard__tap-note">Nhấn vào thẻ để lật mặt.</p>
				</div>
				<div className="flashcard__face flashcard__face--back">
					<span className="flashcard__tag">Mặt sau</span>
					<h2>{word.word}</h2>
					<p className="flashcard__phonetic">{word.phonetic}</p>
					<div className="flashcard__meanings">
						<p><strong>Nghĩa tiếng Anh:</strong> {word.meaningEn}</p>
						<p><strong>Nghĩa tiếng Việt:</strong> {word.meaningVi}</p>
					</div>
					<p className="flashcard__example">{word.example}</p>
				</div>
			</div>

			<div className="study-actions">
				<button type="button" className="vlesson-skip" onClick={onSkip}>
					<Check size={18} style={{ marginRight: '8px' }} />
					Đã thuộc từ này
				</button>
				<button
					type="button"
					className="vlesson-primary"
					onClick={onNextStep}
				>
					Bước 2: Nghe và gõ lại từ
					<ArrowRight size={18} style={{ marginLeft: '8px' }} />
				</button>
			</div>
		</>
	)
}
