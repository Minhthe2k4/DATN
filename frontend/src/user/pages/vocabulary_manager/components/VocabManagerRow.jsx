import React from 'react'
import { Trash2, RotateCcw, Volume2, Eye, EyeOff, Sparkles, Plus } from 'lucide-react'
import { playWordAudio } from '../vocabUtils'

export function VocabManagerRow({ 
	row, 
	index, 
	onUpdateField, 
	onUpdateWord, 
	onBlurWord, 
	onToggleExample, 
	onRegenerate, 
	onRemove, 
	onInsertAfter 
}) {
	return (
		<div className="vmanager-row-stack">
			<article className="vmanager-row-card">
				<div className="vmanager-row-card__top">
					<span className="vmanager-row-card__index">{index + 1}</span>
					<div className="vmanager-row-card__actions">
						{row.status === 'loading' && (
							<span className="vmanager-row-card__status">
								<Sparkles size={14} className="spin-slow" /> AI đang sinh...
							</span>
						)}
						<button type="button" className="vmanager-row-card__remove" onClick={() => onRemove(row.id)}>
							<Trash2 size={14} />
						</button>
					</div>
				</div>

				<div className="vmanager-row-card__grid">
					<div className="vmanager-main-panel">
						<div className="vmanager-field vmanager-field--term">
							<label>Từ vựng</label>
							<input
								type="text"
								value={row.word}
								onChange={(event) => onUpdateWord(row.id, event.target.value)}
								onBlur={() => onBlurWord(row)}
								placeholder="Nhập từ vựng..."
								lang="vi"
							/>
						</div>
					</div>

					<aside className="vmanager-ai-panel">
						<div className="vmanager-ai-panel__head">
							<span>Thông tin AI</span>
							{row.status === 'ready' && <em className="status-badge">Đã sinh</em>}
						</div>
						<div className="vmanager-field-grid vmanager-field-grid--compact">
							<div className="vmanager-field">
								<label>Phiên âm</label>
								<input 
									value={row.pronunciation} 
									onChange={(event) => onUpdateField(row.id, 'pronunciation', event.target.value)} 
									placeholder="AI sẽ điền..." 
								/>
							</div>
							<div className="vmanager-field">
								<label>Cấp độ</label>
								<input 
									value={row.level} 
									onChange={(event) => onUpdateField(row.id, 'level', event.target.value)} 
									placeholder="AI sẽ điền..." 
								/>
							</div>
							<div className="vmanager-field vmanager-field--wide">
								<label>Nghĩa tiếng Anh</label>
								<textarea 
									value={row.meaningEn} 
									onChange={(event) => onUpdateField(row.id, 'meaningEn', event.target.value)} 
									placeholder="AI sẽ điền nghĩa tiếng Anh" 
									rows={2} 
								/>
							</div>
							<div className="vmanager-field vmanager-field--wide">
								<label>Nghĩa tiếng Việt</label>
								<textarea 
									value={row.meaningVi} 
									onChange={(event) => onUpdateField(row.id, 'meaningVi', event.target.value)} 
									placeholder="AI sẽ điền nghĩa tiếng Việt" 
									rows={2} 
									lang="vi" 
								/>
							</div>
							{row.showExample && (
								<>
									<div className="vmanager-field vmanager-field--wide">
										<label>Ví dụ</label>
										<textarea 
											value={row.example} 
											onChange={(event) => onUpdateField(row.id, 'example', event.target.value)} 
											placeholder="AI sẽ điền ví dụ" 
											rows={2} 
										/>
									</div>
									<div className="vmanager-field vmanager-field--wide">
										<label>Dịch ví dụ</label>
										<textarea 
											value={row.exampleVi} 
											onChange={(event) => onUpdateField(row.id, 'exampleVi', event.target.value)} 
											placeholder="AI sẽ dịch ví dụ" 
											rows={2} 
											lang="vi" 
										/>
									</div>
								</>
							)}
						</div>
					</aside>
				</div>

				<div className="vmanager-row-card__footer">
					<button type="button" className="vmanager-mini-btn" onClick={() => onRegenerate(row)}>
						<RotateCcw size={14} /> AI tạo lại
					</button>
					<button type="button" className="vmanager-mini-btn" onClick={() => playWordAudio(row.word)}>
						<Volume2 size={14} /> Audio
					</button>
					<button type="button" className="vmanager-mini-btn" onClick={() => onToggleExample(row.id)}>
						{row.showExample ? <><EyeOff size={14} /> Ẩn ví dụ</> : <><Eye size={14} /> Mở ví dụ</>}
					</button>
					{row.error && <div className="vmanager-ai-box__error">{row.error}</div>}
				</div>
			</article>

			<div className="vmanager-row-stack__add">
				<button type="button" className="vmanager-add-circle" onClick={() => onInsertAfter(row.id)}>
					<Plus size={18} />
				</button>
			</div>
		</div>
	)
}
