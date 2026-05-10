import React from 'react'
import { Volume2, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react'
import { playWordAudio } from '../lessonUtils'

export function TypingStudy({ 
	word, 
	typedLetters, 
	hintPositions, 
	checkState, 
	onTypeChange, 
	onKeyDown, 
	onCheck, 
	onNext, 
	onBackToCard,
	inputRefs 
}) {
	return (
		<div className="typing-stage">
			<div className="typing-stage__head">
				<h3>Nghe audio và nhập lại từ vựng</h3>
				<button type="button" className="vlesson-ghost" onClick={() => playWordAudio(word.word)}>
					<Volume2 size={16} style={{ marginRight: '8px' }} />
					Phát lại audio
				</button>
			</div>

			<div className="letter-inputs">
				{word.word.split('').map((_, index) => {
					const isHint = hintPositions.includes(index)

					return (
						<input
							key={`${word.word}-${index}`}
							ref={(node) => {
								if (inputRefs.current) {
									inputRefs.current[index] = node
								}
							}}
							className={`letter-box${isHint ? ' is-hint' : ''}`}
							type="text"
							inputMode="text"
							maxLength={1}
							value={typedLetters[index] ?? ''}
							disabled={isHint}
							onChange={(event) => onTypeChange(index, event.target.value)}
							onKeyDown={(event) => onKeyDown(index, event)}
							aria-label={`Letter ${index + 1}`}
						/>
					)
				})}
			</div>

			<p className="typing-stage__hint">
				Gợi ý: 1-2 ký tự đầu/cuối đã được điền sẵn giúp bạn nhận diện từ tốt hơn.
			</p>

			<div className="study-actions">
				<button type="button" className="vlesson-ghost" onClick={onBackToCard}>
					<ArrowLeft size={18} style={{ marginRight: '8px' }} />
					Quay lại flashcard
				</button>
				
				{checkState !== 'correct' ? (
					<button type="button" className="vlesson-primary" onClick={onCheck}>
						<CheckCircle2 size={18} style={{ marginRight: '8px' }} />
						Kiểm tra
					</button>
				) : (
					<button type="button" className="vlesson-primary" onClick={onNext}>
						Tiếp tục
						<ArrowRight size={18} style={{ marginLeft: '8px' }} />
					</button>
				)}
			</div>
		</div>
	)
}
