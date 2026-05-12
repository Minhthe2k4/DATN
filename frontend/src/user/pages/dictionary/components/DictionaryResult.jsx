import React from 'react'
import { Volume2, Bookmark } from 'lucide-react'

export function DictionaryResult({ result, onPlayAudio, onSaveMeaning }) {
	if (!result) return null

	return (
		<section className="dictionary-result">
			<div className="dictionary-entry">
				<div className="dictionary-entry__head">
					<h1>{result.word}</h1>
					<span className="dictionary-pill">{result.typeOfWord}</span>
				</div>

				<div className="dictionary-pronunciation-grid">
					<div className="dictionary-pronunciation-line">
						<strong>UK</strong>
						<button type="button" aria-label="Phát âm UK" onClick={() => onPlayAudio(result.ukAudio, result.word)}>
							<Volume2 size={16} />
						</button>
						<span>{result.uk}</span>
					</div>

					<div className="dictionary-pronunciation-line">
						<strong>US</strong>
						<button type="button" aria-label="Phát âm US" onClick={() => onPlayAudio(result.usAudio, result.word)}>
							<Volume2 size={16} />
						</button>
						<span>{result.us}</span>
					</div>
				</div>

				<div className="dictionary-meanings-block">
					{result.meanings.map((meaning) => (
						<article key={meaning.id} className="dictionary-meaning-row">
							<div className="dictionary-meaning-row__title">
								<div className="meaning-title-content">
									{meaning.level && <span className="dictionary-pill dictionary-pill--level">{meaning.level}</span>}
									<span className="dictionary-pill">{meaning.typeOfWord}</span>
									<strong>{meaning.definition}</strong>
								</div>
								<button type="button" className="dictionary-save-icon" aria-label="Lưu nghĩa" onClick={() => onSaveMeaning(meaning)}>
									<Bookmark size={15} />
								</button>
							</div>

							{meaning.meaningVi && (
								<div className="dictionary-meaning-vi">
									🇻🇳 {meaning.meaningVi}
								</div>
							)}

							{meaning.examples && meaning.examples.length > 0 && (
								<div className="dictionary-examples">
									<strong>Ví dụ:</strong>
									<ul>
										{meaning.examples.map((ex, idx) => (
											<li key={idx}>{ex}</li>
										))}
									</ul>
								</div>
							)}
						</article>
					))}
				</div>
			</div>
		</section>
	)
}
