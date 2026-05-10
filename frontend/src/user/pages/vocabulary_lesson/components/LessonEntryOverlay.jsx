import React from 'react'

export function LessonEntryOverlay({ progress, isLoading }) {
	if (!isLoading) return null

	return (
		<div className="vlesson-entry-overlay" role="status" aria-live="polite">
			<div className="vlesson-entry-card">
				<p className="vlesson-entry-title">Chuẩn bị vào bài học...</p>
				<p className="vlesson-entry-subtitle">Flashcard và phần kiểm tra nghe - gõ đang sẵn sàng</p>
				<div className="vlesson-entry-track">
					<div className="vlesson-entry-fill" style={{ width: `${progress}%` }} />
				</div>
				<p className="vlesson-entry-percent">{progress}%</p>
			</div>
		</div>
	)
}
