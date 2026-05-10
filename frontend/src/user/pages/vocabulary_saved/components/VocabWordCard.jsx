import React from 'react'
import { Edit2, Trash2, Save, X, Volume2 } from 'lucide-react'
import { normalizeLevel } from '../vocabSavedUtils'

export function VocabWordCard({ 
	item, 
	isEditing, 
	draft, 
	setDraft, 
	onStartEdit, 
	onCancelEdit, 
	onSave, 
	onRemove 
}) {
	if (isEditing) {
		return (
			<article className="saved-word-card is-editing">
				<div className="edit-field">
					<label>Từ vựng</label>
					<input
						type="text"
						value={draft.word}
						onChange={(event) => setDraft((prev) => ({ ...prev, word: event.target.value }))}
					/>
				</div>
				<div className="edit-field">
					<label>Phiên âm</label>
					<input
						type="text"
						value={draft.pronunciation || ''}
						onChange={(event) => setDraft((prev) => ({ ...prev, pronunciation: event.target.value }))}
						placeholder="Phiên âm"
					/>
				</div>
				<div className="edit-field">
					<label>Nghĩa tiếng Việt</label>
					<textarea
						rows={2}
						value={draft.meaningVi || ''}
						onChange={(event) => setDraft((prev) => ({ ...prev, meaningVi: event.target.value }))}
						placeholder="Nghĩa tiếng Việt"
					/>
				</div>
				<div className="edit-field">
					<label>Nghĩa tiếng Anh</label>
					<textarea
						rows={2}
						value={draft.meaningEn || ''}
						onChange={(event) => setDraft((prev) => ({ ...prev, meaningEn: event.target.value }))}
						placeholder="Nghĩa tiếng Anh"
					/>
				</div>
				<div className="edit-field">
					<label>Cấp độ (1-6)</label>
					<input
						type="number"
						min={1}
						max={6}
						value={draft.level}
						onChange={(event) => setDraft((prev) => ({ ...prev, level: event.target.value }))}
					/>
				</div>
				<div className="saved-word-card__actions">
					<button type="button" className="btn-save" onClick={onSave}>
						<Save size={16} /> Lưu
					</button>
					<button type="button" className="is-ghost" onClick={onCancelEdit}>
						<X size={16} /> Hủy
					</button>
				</div>
			</article>
		)
	}

	return (
		<article className="saved-word-card">
			<div className="saved-word-card__head">
				<h3>{item.word}</h3>
				<span className={`level-badge level-${normalizeLevel(item.level)}`}>
					Cấp {normalizeLevel(item.level)}
				</span>
			</div>
			{item.pronunciation && (
				<div className="phonetic-row">
					<p className="saved-word-card__phonetic">{item.pronunciation}</p>
				</div>
			)}
			<div className="card-meanings">
				{item.meaningVi && <p><strong>VI:</strong> {item.meaningVi}</p>}
				{item.meaningEn && <p><strong>EN:</strong> {item.meaningEn}</p>}
			</div>
			{item.example && <p className="saved-word-card__example">{item.example}</p>}
			<div className="saved-word-card__actions">
				<button type="button" className="btn-edit" onClick={() => onStartEdit(item)}>
					<Edit2 size={14} /> Sửa
				</button>
				<button type="button" className="is-danger" onClick={() => onRemove(item.id)}>
					<Trash2 size={14} /> Xóa
				</button>
			</div>
		</article>
	)
}
