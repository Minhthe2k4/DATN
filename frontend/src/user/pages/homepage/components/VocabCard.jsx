import React from 'react'
import { Volume2, Bookmark } from 'lucide-react'

export function VocabCard({ vocab, onWordClick, onPlayAudio, onSave }) {
	if (!vocab) return null

	return (
		<div className="vocab-card">
			<div className="vocab-card__header">
				<h2 className="vocab-card__title">Từ gợi ý hôm nay</h2>
			</div>
			<div className="vocab-card__content">
				<h3 className="vocab-word" style={{ cursor: 'pointer' }} onClick={() => onWordClick(vocab.word)}>
					{vocab.word}
				</h3>
				<div className="vocab-pronunciation">
					<div className="pronunciation-item">
						<span className="pronunciation-label">UK</span>
						<span className="pronunciation-text">{vocab.phoneticUK || vocab.pronunciation}</span>
						<button className="pronunciation-btn" type="button" aria-label="Play UK pronunciation" onClick={() => onPlayAudio(vocab.word)}>
							<Volume2 size={18} />
						</button>
					</div>
					<div className="pronunciation-item">
						<span className="pronunciation-label">US</span>
						<span className="pronunciation-text">{vocab.phoneticUS || vocab.pronunciation}</span>
						<button className="pronunciation-btn" type="button" aria-label="Play US pronunciation" onClick={() => onPlayAudio(vocab.word)}>
							<Volume2 size={18} />
						</button>
					</div>
				</div>
				<p className="vocab-definition">- {vocab.definition || vocab.meaningEn}</p>
				<p className="vocab-example"><strong>Ví dụ:</strong> {vocab.example}</p>
			</div>
			<div className="vocab-card__footer">
				<button className="word-state-btn word-state-btn--known" type="button" onClick={() => onSave(vocab, false)}>Đã biết</button>
				<button className="save-word-btn" type="button" aria-label="Save word" onClick={() => onSave(vocab, true)}>
					<Bookmark size={20} />
				</button>
			</div>
		</div>
	)
}
