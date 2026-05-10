import React from 'react'

export function VocabReviewOverlay({ progress, isLoading }) {
	if (!isLoading) return null

	return (
		<div className="vocab-review-overlay" role="status" aria-live="polite">
			<div className="vocab-review-card">
				<p className="vocab-review-title">Chuẩn bị vào bài ôn tập...</p>
				<p className="vocab-review-subtitle">Đang tải câu hỏi cho bạn</p>
				<div className="vocab-review-track">
					<div className="vocab-review-fill" style={{ width: `${progress}%` }} />
				</div>
				<p className="vocab-review-percent">{progress}%</p>
			</div>
		</div>
	)
}
