import React from 'react'
import { VocabWordCard } from './VocabWordCard'

export function VocabLevelColumn({ 
	level, 
	words, 
	editingId, 
	draft, 
	setDraft, 
	onStartEdit, 
	onCancelEdit, 
	onSave, 
	onRemove 
}) {
	return (
		<section className="saved-level-column" aria-label={`Cấp độ ${level}`}>
			<header className="saved-level-column__head">
				<h2>Cấp {level}</h2>
				<span>{words.length} từ</span>
			</header>

			<div className="saved-level-column__list">
				{words.length === 0 ? (
					<p className="saved-level-empty">Chưa có từ ở cấp này.</p>
				) : (
					words.map((item) => (
						<VocabWordCard
							key={item.id}
							item={item}
							isEditing={editingId === item.id}
							draft={draft}
							setDraft={setDraft}
							onStartEdit={onStartEdit}
							onCancelEdit={onCancelEdit}
							onSave={onSave}
							onRemove={onRemove}
						/>
					))
				)}
			</div>
		</section>
	)
}
