import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import {
	fetchDashboard,
	fetchNewsFeed,
	fetchSuggestedContent,
	fetchSuggestedVocab,
	fetchTodayVocab,
	fetchActivityCalendar
} from './homepage.api'
import './homepage.css'

import {
	Search,
	ChevronDown,
	FileText,
	Headphones,
	Video,
	Dice5,
	Bookmark,
	Volume2,
	RotateCcw,
	PlusSquare,
	Zap,
	CheckCircle
} from 'lucide-react'

function StudyCalendar({ activityDates }) {
	const now = new Date()
	const currentMonth = now.getMonth()
	const currentYear = now.getFullYear()

	const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

	const monthName = new Intl.DateTimeFormat('vi-VN', { month: 'long' }).format(now)

	const calendarDays = []
	// Padding for previous month
	for (let i = 0; i < firstDayOfMonth; i++) {
		calendarDays.push({ day: null, fullDate: null })
	}
	// Days of current month
	for (let i = 1; i <= daysInMonth; i++) {
		const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
		calendarDays.push({ day: i, fullDate })
	}

	return (
		<div className="study-calendar">
			<div className="study-calendar__header">
				<h3 className="study-calendar__title">Lịch học tập</h3>
				<span className="study-calendar__month">{monthName} {currentYear}</span>
			</div>
			<div className="study-calendar__grid">
				<span className="day-name">CN</span>
				<span className="day-name">T2</span>
				<span className="day-name">T3</span>
				<span className="day-name">T4</span>
				<span className="day-name">T5</span>
				<span className="day-name">T6</span>
				<span className="day-name">T7</span>

				{calendarDays.map((d, idx) => {
					const isActive = d.fullDate && activityDates.includes(d.fullDate)
					const isToday = d.fullDate === now.toISOString().split('T')[0]

					return (
						<div
							key={idx}
							className={`calendar-day${!d.day ? ' empty' : ''}${isActive ? ' active' : ''}${isToday ? ' today' : ''}`}
							title={d.fullDate}
						>
							{d.day}
						</div>
					)
				})}
			</div>
			<div className="study-calendar__footer">
				<div className="legend-item">
					<span className="legend-dot active"></span>
					<span>Đã học</span>
				</div>
				<div className="legend-item">
					<span className="legend-dot today"></span>
					<span>Hôm nay</span>
				</div>
			</div>
		</div>
	)
}

export function Homepage() {
	const navigate = useNavigate();
	const session = getUserSession();
	const isLoggedIn = !!session;

	const [dashboard, setDashboard] = useState({});
	const [suggestedVocab, setSuggestedVocab] = useState([]);
	const [suggestedContent, setSuggestedContent] = useState([]);
	const [todayVocab, setTodayVocab] = useState(null);
	const [newsFeed, setNewsFeed] = useState([]);
	const [activityDates, setActivityDates] = useState([]);

	useEffect(() => {
		if (!isLoggedIn) return;
		fetchDashboard().then(setDashboard).catch(() => { });
		fetchActivityCalendar().then(setActivityDates).catch(() => []);
	}, [isLoggedIn]);

	useEffect(() => {
		fetchSuggestedVocab().then(setSuggestedVocab).catch(() => []);
		fetchSuggestedContent().then(setSuggestedContent).catch(() => []);
		fetchTodayVocab().then(setTodayVocab).catch(() => null);
		fetchNewsFeed().then(setNewsFeed).catch(() => []);
	}, []);

	return (
		<div className="homepage">
			<div className="homepage__container">
				<section className="today-focus">
					<div className="today-focus__left">
						<p className="today-focus__eyebrow">{isLoggedIn ? 'HỌC HÔM NAY' : 'CHÀO MỪNG BẠN'}</p>
						<h1 className="today-focus__title">
							{isLoggedIn ? 'Học tập đều đặn mỗi ngày' : 'Bắt đầu hành trình chinh phục tiếng Anh'}
						</h1>
						<p className="today-focus__description">
							{isLoggedIn
								? 'Hãy bắt đầu với ôn tập để giữ nhịp học đều, sau đó học thêm từ mới để mở rộng vốn từ.'
								: 'Khám phá hàng ngàn từ vựng, bài đọc và video sinh động. Đăng ký ngay để theo dõi tiến độ của riêng bạn.'}
						</p>
						<div className="today-focus__actions">
							{isLoggedIn ? (
								<>
									<button className="btn btn--primary" type="button" onClick={() => navigate('/vocabulary')} disabled={dashboard.reviewCount === 0}>Ôn ngay</button>
									<button className="btn btn--secondary" type="button" onClick={() => navigate('/vocabulary-lesson')}>Học từ mới</button>
									<button className="btn btn--secondary" type="button" onClick={() => navigate('/vocabulary-manager')}>Thêm từ thủ công</button>
								</>
							) : (
								<>
									<button className="btn btn--primary" type="button" onClick={() => navigate('/register')}>Đăng ký miễn phí</button>
									<button className="btn btn--secondary" type="button" onClick={() => navigate('/dictionary')}>Tra từ điển</button>
								</>
							)}
						</div>
					</div>
					<div className="today-focus__right" aria-label={isLoggedIn ? "Thống kê của bạn" : "Tính năng nổi bật"}>
						{isLoggedIn ? (
							<>
								<div className="today-metric">
									<div className="today-metric__head">
										<span className="metric-icon metric-icon--review" aria-hidden="true">
											<RotateCcw size={18} />
										</span>
									</div>
									<span className="today-metric__label">Cần ôn tập</span>
									<strong className="today-metric__value">{dashboard.reviewCount ?? 0}</strong>
								</div>
								<div className="today-metric">
									<div className="today-metric__head">
										<span className="metric-icon metric-icon--new" aria-hidden="true">
											<PlusSquare size={18} />
										</span>
									</div>
									<span className="today-metric__label">Từ mới</span>
									<strong className="today-metric__value">{dashboard.newWordCount ?? 0}</strong>
								</div>
							</>
						) : (
							<>
								<div className="today-metric">
									<div className="today-metric__head">
										<span className="metric-icon metric-icon--streak" aria-hidden="true">
											<Zap size={20} fill="currentColor" />
										</span>
									</div>
									<span className="today-metric__label">Kho từ vựng</span>
									<strong className="today-metric__value">5000+</strong>
								</div>
								<div className="today-metric">
									<div className="today-metric__head">
										<span className="metric-icon metric-icon--learned" aria-hidden="true">
											<CheckCircle size={20} fill="currentColor" />
										</span>
									</div>
									<span className="today-metric__label">Bài học</span>
									<strong className="today-metric__value">Đa dạng</strong>
								</div>
							</>
						)}
					</div>
				</section>

				{/* Search Bar */}
				<div className="search-bar">
					<div className="search-bar__input-wrapper">
						<Search size={20} />
						<input
							type="text"
							className="search-bar__input"
							placeholder="Tìm kiếm từ vựng"
							aria-label="Search vocabulary"
						/>
					</div>
					<button className="language-selector" type="button" onClick={() => navigate('/dictionary')}>
						Anh - Anh
						<ChevronDown size={18} />
					</button>
				</div>

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

				<div className="homepage__content">
					<div className="homepage__main">
						<section className="hot-search" aria-label="Từ vựng gợi ý">
							<h2 className="hot-search__title">Từ vựng gợi ý</h2>
							<p className="hot-search__subtitle">Ưu tiên từ phổ biến và những từ bạn đã tra gần đây.</p>
							<div className="hot-search__tags">
								{suggestedVocab.map((v, idx) => (
									<button key={idx} className="tag" type="button">{v.word}</button>
								))}
							</div>
						</section>

						<div className="learning-banner" role="region" aria-label="Mục tiêu hôm nay">
							<div className="learning-banner__content">
								<p className="learning-banner__eyebrow">Mục tiêu hôm nay</p>
								<h3 className="learning-banner__title">Hoàn thành {dashboard.reviewCount || 0} từ ôn tập</h3>
								<p className="learning-banner__description">Giữ streak {dashboard.streak || 0} ngày bằng một phiên học ngắn 15-20 phút.</p>
							</div>
							<button className="learning-banner__button" type="button" onClick={() => navigate('/vocabulary')}>Bắt đầu phiên học</button>
						</div>

						{/* Suggested Content */}
						<section className="suggested-content">
							<h2 className="section-title">Suggested Content</h2>
							<div className="content-list">
								{suggestedContent.map((item, idx) => (
									<article key={idx} className="content-item">
										{item.type === 'article' && <FileText size={24} color="#8B5CF6" />}
										{item.type === 'video' && <Video size={24} color="#EF4444" />}
										{item.type === 'tip' && <Dice5 size={24} color="#10B981" />}
										<h3 className="content-item__title">{item.title}</h3>
									</article>
								))}
							</div>
						</section>
					</div>

					{/* Right Sidebar */}
					<aside className="homepage__sidebar">
						{isLoggedIn && <StudyCalendar activityDates={activityDates} />}
						
						{/* Today Suggested Word */}
						{todayVocab && (
							<div className="vocab-card">
								<div className="vocab-card__header">
									<h2 className="vocab-card__title">Từ gợi ý hôm nay</h2>
								</div>
								<div className="vocab-card__content">
									<h3 className="vocab-word">{todayVocab.word}</h3>
									<div className="vocab-pronunciation">
										<div className="pronunciation-item">
											<span className="pronunciation-label">UK</span>
											<span className="pronunciation-text">{todayVocab.phoneticUK || todayVocab.pronunciation}</span>
											<button className="pronunciation-btn" type="button" aria-label="Play UK pronunciation">
												<Volume2 size={18} />
											</button>
										</div>
										<div className="pronunciation-item">
											<span className="pronunciation-label">US</span>
											<span className="pronunciation-text">{todayVocab.phoneticUS || todayVocab.pronunciation}</span>
											<button className="pronunciation-btn" type="button" aria-label="Play US pronunciation">
												<Volume2 size={18} />
											</button>
										</div>
									</div>
									<p className="vocab-definition">- {todayVocab.definition || todayVocab.meaningEn}</p>
									<p className="vocab-example"><strong>Ví dụ:</strong> {todayVocab.example}</p>
								</div>
								<div className="vocab-card__footer">
									<button className="word-state-btn word-state-btn--known" type="button">Đã biết</button>
									<button className="word-state-btn word-state-btn--unknown" type="button">Chưa biết</button>
									<button className="save-word-btn" type="button" aria-label="Save word">
										<Bookmark size={20} />
									</button>
								</div>
							</div>
						)}

						<section className="news-feed news-feed--compact">
							<h2 className="news-feed__title">News Feed</h2>
							{newsFeed.map((news, idx) => (
								<div key={idx} className="news-card news-card--compact">
									<h3 className="news-card__title">{news.title}</h3>
									<p className="news-card__description">{news.description}</p>
								</div>
							))}
						</section>
					</aside>
				</div>
			</div>
		</div>
	)
}
