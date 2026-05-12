import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import './vocabulary.css'

import { VocabReviewOverlay } from './components/VocabReviewOverlay'
import { VocabStatsCard } from './components/VocabStatsCard'
import { VocabTrainingCard } from './components/VocabTrainingCard'

/**
 * Trang tổng quan học từ vựng (Vocabulary Dashboard).
 * Hiển thị tiến độ học tập, biểu đồ trình độ và nút bắt đầu ôn tập "Thời điểm vàng" (SRS).
 */
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

	const fetchDashboard = async () => {
		try {
			const response = await fetch('/api/user/dashboard', {
				headers: { ...getAuthHeader() }
			})
			if (response.ok) {
				const data = await response.json()
				setDashboard(data)
				if (data.nextReviewTime) {
					const next = new Date(data.nextReviewTime).getTime()
					const diff = Math.max(0, Math.floor((next - new Date().getTime()) / 1000))
					setRemainingSeconds(diff)
				}
			}
		} catch (error) {
			console.error('Error fetching dashboard:', error)
		}
	}

	useEffect(() => {
		fetchDashboard()
	}, [session?.userId])

	useEffect(() => {
		if (remainingSeconds <= 0) return
		const timerId = window.setInterval(() => {
			setRemainingSeconds((prev) => {
				if (prev <= 1) {
					window.dispatchEvent(new CustomEvent('new-notification', {
						detail: { message: "✨ Đã đến giờ ôn tập!", type: "REVIEW_REMINDER" }
					}))
					fetchDashboard()
					return 0
				}
				return prev - 1
			})
		}, 1000)
		return () => window.clearInterval(timerId)
	}, [remainingSeconds])

	const premiumStatus = usePremiumStatus(userId)
	const isSRSUnlocked = premiumStatus?.featureLimits?.SRS_GOLDEN_TIME?.IS_LOCKED === false
	const isDashboardLocked = !premiumStatus?.isPremium && !isSRSUnlocked

	// Xử lý khi nhấn nút "Ôn tập ngay"
	const handleReviewClick = () => {
		if (isReviewLoading || dashboard.reviewCount === 0) return
		setIsReviewLoading(true)
		setReviewLoadingProgress(0)
		
		// Giả lập hiệu ứng Loading mượt mà trước khi vào bài kiểm tra SRS
		reviewLoadingIntervalRef.current = window.setInterval(() => {
			setReviewLoadingProgress((prev) => (prev >= 96 ? prev : prev + 4))
		}, 28)
		reviewLoadingTimeoutRef.current = window.setTimeout(() => {
			window.clearInterval(reviewLoadingIntervalRef.current)
			setReviewLoadingProgress(100)
			window.setTimeout(() => {
				setIsReviewLoading(false)
				// Chuyển hướng sang trang làm bài kiểm tra ôn tập
				navigate('/vocabulary-test')
			}, 120)
		}, 760)
	}

	const reviewCountdown = useMemo(() => {
		if (remainingSeconds <= 0) return '00:00:00'
		const h = Math.floor(remainingSeconds / 3600)
		const m = Math.floor((remainingSeconds % 3600) / 60)
		const s = remainingSeconds % 60
		return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
	}, [remainingSeconds])

	const statsPercentage = useMemo(() => {
		if (!dashboard.totalPossible) return '0.00'
		return ((dashboard.totalLearned / dashboard.totalPossible) * 100).toFixed(2)
	}, [dashboard.totalLearned, dashboard.totalPossible])

	return (
		<div className="vocabulary-page">
			<VocabReviewOverlay progress={reviewLoadingProgress} isLoading={isReviewLoading} />

			<div className="vocabulary-page__container">
				<header className="vocabulary-page__header">
					<p className="vocabulary-page__eyebrow">Học từ vựng</p>
					<h1 className="vocabulary-page__title">Chọn cách bạn muốn mở rộng vốn từ</h1>
					<p className="vocabulary-page__subtitle">
						Theo dõi tiến độ, ôn từ và tiếp tục học trong một không gian thống nhất.
					</p>
				</header>

				<div className="vocabulary-page__top">
					<VocabStatsCard 
						dashboard={dashboard}
						isLoggedIn={isLoggedIn}
						isDashboardLocked={isDashboardLocked}
						statsPercentage={statsPercentage}
						reviewCountdown={reviewCountdown}
						onNavigate={navigate}
						onReview={handleReviewClick}
					/>

					<VocabTrainingCard onNavigate={navigate} />
				</div>
			</div>
		</div>
	)
}
