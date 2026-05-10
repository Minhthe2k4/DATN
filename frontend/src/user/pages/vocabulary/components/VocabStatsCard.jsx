import React from 'react'
import { HelpCircle, CheckCircle, Lock, History, Sparkles } from 'lucide-react'

export function VocabStatsCard({ 
	dashboard, 
	isLoggedIn, 
	isDashboardLocked, 
	statsPercentage, 
	reviewCountdown, 
	onNavigate, 
	onReview 
}) {
	if (!isLoggedIn) {
		return (
			<div className="stats-card">
				<div className="stats-card__header">
					<h2 className="stats-card__title">Thống kê từ vựng</h2>
				</div>
				<div className="stats-card__body">
					<div className="stats-login-prompt">
						<div className="stats-login-prompt__icon">
							<Lock size={40} />
						</div>
						<h3 className="stats-login-prompt__title">Đăng nhập để xem thống kê</h3>
						<p className="stats-login-prompt__text">Hãy đăng nhập để theo dõi tiến độ học tập và biểu đồ thành thạo từ vựng của bạn.</p>
						<button className="stats-login-prompt__btn" type="button" onClick={() => onNavigate('/login')}>
							Đăng nhập ngay
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="stats-card">
			<div className="stats-card__header">
				<h2 className="stats-card__title">Thống kê từ vựng của bạn</h2>
				<div className="stats-card__header-actions">
					<button
						className="stats-card__saved-btn"
						type="button"
						onClick={() => onNavigate('/vocabulary-saved')}
					>
						<History size={16} style={{ marginRight: '8px' }} />
						Từ đã lưu
					</button>
					<button className="help-btn" type="button" aria-label="Trợ giúp">
						<HelpCircle size={20} />
					</button>
				</div>
			</div>

			<div className="stats-card__body">
				<div className="total-words">
					<p className="total-words__label">Tổng số từ đã học:</p>
					<div className="total-words__value">
						<span className="big-number">{dashboard.totalLearned || 0}</span>
						<span className="fraction">/{dashboard.totalPossible || 0}</span>
						<span className="percentage">
							<CheckCircle size={16} color="#10b981" />
							{statsPercentage}%
						</span>
					</div>
				</div>

				<div className={`stats-breakdown ${isDashboardLocked ? 'is-locked' : ''}`}>
					{isDashboardLocked && (
						<div className="stats-lock-overlay">
							<div className="stats-lock-content">
								<div className="stats-lock-icon"><Lock size={32} /></div>
								<h3>Phân tích chuyên sâu</h3>
								<p>Nâng cấp Premium để xem biểu đồ chi tiết, phân tích mức độ thành thạo và ôn tập theo <strong>Thời điểm vàng</strong>.</p>
								<button
									type="button"
									className="stats-upgrade-btn"
									onClick={() => onNavigate('/subscription')}
								>
									Nâng cấp ngay
								</button>
							</div>
						</div>
					)}
					<div className="stats-breakdown__top">
						<div className="stats-breakdown__chart-container">
							<div className="stats-breakdown__grid" aria-hidden="true">
								<span /> <span /> <span /> <span />
							</div>
							<div className="stats-breakdown__bars">
								{[1, 2, 3, 4, 5, 6].map((lvl) => {
									const count = dashboard.levelDistribution?.[lvl] || 0
									const maxCount = Math.max(...Object.values(dashboard.levelDistribution || {}), 1)
									const heightPct = count > 0 ? 20 + (count / maxCount) * 70 : 4
									return (
										<div key={lvl} className="stats-bar-wrapper">
											<div
												className={`stats-bar stats-bar--lvl${lvl}`}
												style={{ height: `${heightPct}%` }}
												title={`Cấp độ ${lvl}: ${count} từ`}
											>
												{count > 0 && <span className="stats-bar__count">{count}</span>}
											</div>
											<span className="stats-bar-label">L{lvl}</span>
										</div>
									)
								})}
							</div>
						</div>

						<div className="stats-breakdown__legend">
							{[
								{ lvl: 6, label: 'Thành thạo', color: 'blue' },
								{ lvl: 5, label: 'Tốt', color: 'green' },
								{ lvl: 4, label: 'Ổn', color: 'teal' },
								{ lvl: 3, label: 'Trung bình', color: 'yellow' },
								{ lvl: 2, label: 'Khó', color: 'orange' },
								{ lvl: 1, label: 'Mới học', color: 'red' },
							].map((item) => (
								<div key={item.lvl} className="legend-item">
									<span className={`legend-dot legend-dot--${item.color}`} />
									<span className="legend-text">Lv.{item.lvl} - {item.label}</span>
									<span className="legend-value">{dashboard.levelDistribution?.[item.lvl] || 0}</span>
								</div>
							))}
						</div>
					</div>

					<div className="review-reminder" aria-live="polite">
						<div className="review-reminder__meta">
							<p className="review-reminder__line">Từ cần ôn: <strong>{dashboard.reviewCount}</strong></p>
							<p className="review-reminder__line">Lần ôn tiếp theo: <strong>{dashboard.nextReviewTime ? reviewCountdown : 'Sẵn sàng'}</strong></p>
						</div>
						<button
							className="review-reminder__btn"
							type="button"
							onClick={onReview}
							disabled={dashboard.reviewCount === 0}
						>
							<Sparkles size={16} style={{ marginRight: '8px' }} />
							Ôn tập ngay
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
