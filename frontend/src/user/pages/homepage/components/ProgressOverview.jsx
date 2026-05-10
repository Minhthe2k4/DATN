import React from 'react'
import { Zap, CheckCircle, RotateCcw } from 'lucide-react'

export function ProgressOverview({ dashboard }) {
	return (
		<section className="progress-overview" aria-label="Tiến độ học tập">
			<article className="progress-card">
				<div className="progress-card__head">
					<span className="metric-icon metric-icon--streak" aria-hidden="true">
						<Zap size={18} />
					</span>
				</div>
				<p className="progress-card__label">Streak</p>
				<p className="progress-card__value">{dashboard.streak || 0} ngày</p>
			</article>
			<article className="progress-card">
				<div className="progress-card__head">
					<span className="metric-icon metric-icon--learned" aria-hidden="true">
						<CheckCircle size={18} />
					</span>
				</div>
				<p className="progress-card__label">Tổng từ đã học</p>
				<p className="progress-card__value">{dashboard.totalLearned || 0} từ</p>
			</article>
			<article className="progress-card">
				<div className="progress-card__head">
					<span className="metric-icon metric-icon--review" aria-hidden="true">
						<RotateCcw size={18} />
					</span>
				</div>
				<p className="progress-card__label">Cần ôn hôm nay</p>
				<p className="progress-card__value">{dashboard.reviewCount || 0} từ</p>
			</article>
		</section>
	)
}
