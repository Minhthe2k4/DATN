import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import './vocabulary.css'

function QuestionCircleIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
			<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
			<path d="M12 16v.01M12 13a2 2 0 002-2c0-1.1-.9-2-2-2s-2 .9-2 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	)
}

export function Vocabulary() {
	const navigate = useNavigate()
	const session = getUserSession()
	const userId = session?.userId ? Number(session.userId) : null
	const isLoggedIn = !!session

	const [dashboard, setDashboard] = useState({
		reviewCount: 0,
		totalLearned: 0,
		totalPossible: 0,
		levelDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
		nextReviewTime: null
	})

	const [isReviewLoading, setIsReviewLoading] = useState(false)
	const [reviewLoadingProgress, setReviewLoadingProgress] = useState(0)
	const [remainingSeconds, setRemainingSeconds] = useState(0)

	const reviewLoadingIntervalRef = useRef(null)
	const reviewLoadingTimeoutRef = useRef(null)

	// Fetch dashboard data
	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				const response = await fetch('/api/user/dashboard', {
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('token') || session?.userId}`
					}
				})
				if (response.ok) {
					const data = await response.json()
					setDashboard(data)

					// Calculate remaining seconds for countdown
					if (data.nextReviewTime) {
						const next = new Date(data.nextReviewTime).getTime()
						const now = new Date().getTime()
						const diff = Math.max(0, Math.floor((next - now) / 1000))
						setRemainingSeconds(diff)
					}
				}
			} catch (error) {
				console.error('Error fetching dashboard:', error)
			}
		}

		fetchDashboard()
	}, [session?.userId])

	// Countdown timer
	useEffect(() => {
		if (remainingSeconds <= 0) return undefined

		const timerId = window.setInterval(() => {
			setRemainingSeconds((prev) => Math.max(0, prev - 1))
		}, 1000)

		return () => window.clearInterval(timerId)
	}, [remainingSeconds])

	const premiumStatus = usePremiumStatus(userId)

	const handleReviewClick = () => {
		if (isReviewLoading) return

		// Kiểm tra quyền truy cập tính năng Ôn tập (SRS)
		const reviewLimit = premiumStatus?.featureLimits?.VOCABULARY_REVIEW
		if (reviewLimit?.IS_LOCKED) {
			alert(`🔒 Tính năng Ôn tập từ vựng thời điểm vàng hiện đang bị khóa cho gói cước của bạn.\nHãy nâng cấp gói cước để sử dụng tính năng này!`)
			return
		}

		// Fallback nếu không có dữ liệu limit (ví dụ: Free chưa cấu hình)
		if (!premiumStatus?.isPremium && !reviewLimit) {
			alert('✨ Tính năng ôn tập từ vựng (SRS) chỉ dành cho thành viên Premium. Hãy nâng cấp ngay để sử dụng!')
			return
		}

		if (dashboard.reviewCount === 0) {
			alert('Hiện tại bạn không có từ nào cần ôn tập.')
			return
		}

		setIsReviewLoading(true)
		setReviewLoadingProgress(0)

		reviewLoadingIntervalRef.current = window.setInterval(() => {
			setReviewLoadingProgress((prev) => (prev >= 96 ? prev : prev + 4))
		}, 28)

		reviewLoadingTimeoutRef.current = window.setTimeout(() => {
			window.clearInterval(reviewLoadingIntervalRef.current)
			reviewLoadingIntervalRef.current = null
			setReviewLoadingProgress(100)
			window.setTimeout(() => {
				setIsReviewLoading(false)
				navigate('/vocabulary-test')
			}, 120)
		}, 760)
	}

	const reviewCountdown = useMemo(() => {
		if (remainingSeconds <= 0) return '00:00:00'
		const hours = Math.floor(remainingSeconds / 3600)
		const minutes = Math.floor((remainingSeconds % 3600) / 60)
		const seconds = remainingSeconds % 60

		return [hours, minutes, seconds]
			.map((value) => String(value).padStart(2, '0'))
			.join(':')
	}, [remainingSeconds])

	const statsPercentage = useMemo(() => {
		if (!dashboard.totalPossible) return '0.00'
		return ((dashboard.totalLearned / dashboard.totalPossible) * 100).toFixed(2)
	}, [dashboard.totalLearned, dashboard.totalPossible])

	return (
		<div className="vocabulary-page">
			{isReviewLoading && (
				<div className="vocab-review-overlay" role="status" aria-live="polite">
					<div className="vocab-review-card">
						<p className="vocab-review-title">Chuẩn bị vào bài ôn tập...</p>
						<p className="vocab-review-subtitle">Đang tải câu hỏi cho bạn</p>
						<div className="vocab-review-track">
							<div className="vocab-review-fill" style={{ width: `${reviewLoadingProgress}%` }} />
						</div>
						<p className="vocab-review-percent">{reviewLoadingProgress}%</p>
					</div>
				</div>
			)}

			<div className="vocabulary-page__container">
				<header className="vocabulary-page__header">
					<p className="vocabulary-page__eyebrow">Học từ vựng</p>
					<h1 className="vocabulary-page__title">Chọn cách bạn muốn mở rộng vốn từ</h1>
					<p className="vocabulary-page__subtitle">
						Theo dõi tiến độ, ôn từ và tiếp tục học trong một không gian thống nhất.
					</p>
				</header>

				<div className="vocabulary-page__top">
					{/* Vocabulary Statistics */}
					<div className="stats-card">
						<div className="stats-card__header">
							<h2 className="stats-card__title">Thống kê từ vựng của bạn</h2>
							<div className="stats-card__header-actions">
								<button
									className="stats-card__saved-btn"
									type="button"
									onClick={() => navigate('/vocabulary-saved')}
								>
									Xem từ đã lưu
								</button>
								<button className="help-btn" type="button" aria-label="Trợ giúp">
									<QuestionCircleIcon />
								</button>
							</div>
						</div>

						<div className="stats-card__body">
							{isLoggedIn ? (
								<>
									<div className="total-words">
										<p className="total-words__label">Tổng số từ đã học:</p>
										<div className="total-words__value">
											<span className="big-number">{dashboard.totalLearned || 0}</span>
											<span className="fraction">/{dashboard.totalPossible || 0}</span>
											<span className="percentage">
												<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
													<circle cx="12" cy="12" r="10" fill="none" stroke="#10b981" strokeWidth="2" />
													<path d="M12 6v6l4 2" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
												</svg>
												{statsPercentage}%
											</span>
										</div>
									</div>

									<div className={`stats-breakdown ${!premiumStatus?.isPremium ? 'is-locked' : ''}`}>
										{!premiumStatus?.isPremium && (
											<div className="stats-lock-overlay">
												<div className="stats-lock-content">
													<div className="stats-lock-icon">🔒</div>
													<h3>Phân tích chuyên sâu</h3>
													<p>Nâng cấp Premium để xem biểu đồ chi tiết, phân tích mức độ thành thạo và ôn tập theo thời điểm vàng.</p>
													<button
														type="button"
														className="stats-upgrade-btn"
														onClick={() => navigate('/subscription')}
													>
														Nâng cấp ngay
													</button>
												</div>
											</div>
										)}
										<div className="stats-breakdown__top">
											{/* Column Chart */}
											<div className="stats-breakdown__chart-container">
												<div className="stats-breakdown__grid" aria-hidden="true">
													<span /> <span /> <span /> <span />
												</div>
												<div className="stats-breakdown__bars">
													{[1, 2, 3, 4, 5, 6].map((lvl) => {
														const count = dashboard.levelDistribution?.[lvl] || 0
														const maxCount = Math.max(...Object.values(dashboard.levelDistribution || {}), 1)
														// If count > 0, give it at least 20% height + proportional height
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
												<div className="legend-item">
													<span className="legend-dot legend-dot--blue" />
													<span className="legend-text">Lv.6 - Thành thạo</span>
													<span className="legend-value">{dashboard.levelDistribution?.[6] || 0}</span>
												</div>
												<div className="legend-item">
													<span className="legend-dot legend-dot--green" />
													<span className="legend-text">Lv.5 - Tốt</span>
													<span className="legend-value">{dashboard.levelDistribution?.[5] || 0}</span>
												</div>
												<div className="legend-item">
													<span className="legend-dot legend-dot--teal" />
													<span className="legend-text">Lv.4 - Ổn</span>
													<span className="legend-value">{dashboard.levelDistribution?.[4] || 0}</span>
												</div>
												<div className="legend-item">
													<span className="legend-dot legend-dot--yellow" />
													<span className="legend-text">Lv.3 - Trung bình</span>
													<span className="legend-value">{dashboard.levelDistribution?.[3] || 0}</span>
												</div>
												<div className="legend-item">
													<span className="legend-dot legend-dot--orange" />
													<span className="legend-text">Lv.2 - Khó</span>
													<span className="legend-value">{dashboard.levelDistribution?.[2] || 0}</span>
												</div>
												<div className="legend-item">
													<span className="legend-dot legend-dot--red" />
													<span className="legend-text">Lv.1 - Mới học</span>
													<span className="legend-value">{dashboard.levelDistribution?.[1] || 0}</span>
												</div>
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
												onClick={handleReviewClick}
												disabled={dashboard.reviewCount === 0}
											>
												Ôn tập ngay
											</button>
										</div>
									</div>

								</>
							) : (
								<div className="stats-login-prompt">
									<div className="stats-login-prompt__icon">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
											<path d="M7 11V7a5 5 0 0110 0v4" />
										</svg>
									</div>
									<h3 className="stats-login-prompt__title">Đăng nhập để xem thống kê</h3>
									<p className="stats-login-prompt__text">Hãy đăng nhập để theo dõi tiến độ học tập và biểu đồ thành thạo từ vựng của bạn.</p>
									<button className="stats-login-prompt__btn" type="button" onClick={() => navigate('/login')}>
										Đăng nhập ngay
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Training Card */}
					<div className="training-card">
						<div className="training-card__header">
							<h2 className="training-card__title">Luyện tập</h2>
							<button className="help-btn" type="button" aria-label="Trợ giúp">
								<QuestionCircleIcon />
							</button>
						</div>
						<div className="training-card__body">
							<div className="training-illustration">
								<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Cg opacity='0.3'%3E%3Crect x='40' y='60' width='120' height='80' rx='4' fill='%23e5e7eb' /%3E%3Crect x='50' y='50' width='120' height='80' rx='4' fill='%23d1d5db' /%3E%3Crect x='60' y='40' width='120' height='80' rx='4' fill='%23f3f4f6' stroke='%239ca3af' stroke-width='2' /%3E%3C/g%3E%3C/svg%3E" alt="Học từ mới" />
							</div>
							<p className="training-card__message">Bắt đầu hành trình học để nâng cao vốn từ mỗi ngày!</p>
						</div>
						<div className="training-card__footer">
							<div className="training-card__footer-actions">
								<button className="learn-btn" type="button" onClick={() => navigate('/vocabulary-lesson')}>Học từ mới</button>
								<button className="learn-btn learn-btn--secondary" type="button" onClick={() => navigate('/vocabulary-manager')}>Thêm từ vựng thủ công</button>
							</div>
						</div>
					</div>
				</div>
			</div >
		</div >

	)
}
