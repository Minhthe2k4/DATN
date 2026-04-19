import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import { 
	fetchDashboard, 
	fetchNewsFeed, 
	fetchSuggestedContent, 
	fetchSuggestedVocab, 
	fetchTodayVocab 
} from './homepage.api'
import './homepage.css'

function SearchIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
			<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
			<path d="M16 16l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	)
}

function ChevronDownIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
			<path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

function DocumentIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
			<rect x="6" y="4" width="12" height="16" rx="1.5" fill="#8B5CF6" />
			<path d="M9 9h6M9 12h6M9 15h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	)
}

function HeadsetIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
			<rect x="4" y="4" width="16" height="16" rx="8" fill="#3B82F6" />
			<path d="M8 12a4 4 0 018 0v2h-2v-2a2 2 0 00-4 0v2H8v-2z" fill="white" />
		</svg>
	)
}

function VideoIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
			<rect x="4" y="4" width="16" height="16" rx="2" fill="#EF4444" />
			<path d="M10 9l5 3-5 3z" fill="white" />
		</svg>
	)
}

function DiceIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
			<rect x="4" y="4" width="16" height="16" rx="2" fill="#10B981" />
			<circle cx="12" cy="12" r="1.5" fill="white" />
			<circle cx="9" cy="9" r="1" fill="white" />
			<circle cx="15" cy="15" r="1" fill="white" />
		</svg>
	)
}

function BookmarkIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
			<path d="M5 3h14v18l-7-4-7 4V3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
		</svg>
	)
}

function SpeakerIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
			<path d="M11 5L6 9H2v6h4l5 4V5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
			<path d="M15.54 8.46a5 5 0 010 7.07M18.37 5.63a9 9 0 010 12.73" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
		</svg>
	)
}

function ReviewIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
			<path d="M20 12a8 8 0 11-2.34-5.66" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
			<path d="M20 4v6h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

function NewWordIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
			<rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
			<path d="M12 8v8M8 12h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
		</svg>
	)
}

function StreakIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
			<path d="M12 3s5 4.2 5 8.4A5 5 0 1112 21a5 5 0 01-5-5.6C7 7.2 12 3 12 3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
		</svg>
	)
}

function LearnedIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
			<path d="M4 6.5A2.5 2.5 0 016.5 4H20v14H6.5A2.5 2.5 0 014 15.5v-9z" fill="none" stroke="currentColor" strokeWidth="1.8" />
			<path d="M8 9h8M8 12h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
		</svg>
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

	useEffect(() => {
		if (!isLoggedIn) return;
		fetchDashboard().then(setDashboard).catch(() => {});
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
											<ReviewIcon />
										</span>
									</div>
									<span className="today-metric__label">Cần ôn tập</span>
									<strong className="today-metric__value">{dashboard.reviewCount ?? 0}</strong>
								</div>
								<div className="today-metric">
									<div className="today-metric__head">
										<span className="metric-icon metric-icon--new" aria-hidden="true">
											<NewWordIcon />
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
											<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
												<path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
											</svg>
										</span>
									</div>
									<span className="today-metric__label">Kho từ vựng</span>
									<strong className="today-metric__value">5000+</strong>
								</div>
								<div className="today-metric">
									<div className="today-metric__head">
										<span className="metric-icon metric-icon--learned" aria-hidden="true">
											<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
												<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
											</svg>
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
						<SearchIcon />
						<input 
							type="text" 
							className="search-bar__input" 
							placeholder="Tìm kiếm từ vựng"
							aria-label="Search vocabulary"
						/>
					</div>
					<button className="language-selector" type="button" onClick={() => navigate('/dictionary')}>
						Anh - Anh
						<ChevronDownIcon />
					</button>
				</div>

				<section className="progress-overview" aria-label="Tiến độ học tập">
					<article className="progress-card">
						<div className="progress-card__head">
							<span className="metric-icon metric-icon--streak" aria-hidden="true">
								<StreakIcon />
							</span>
						</div>
						<p className="progress-card__label">Streak</p>
						<p className="progress-card__value">{dashboard.streak || 0} ngày</p>
					</article>
					<article className="progress-card">
						<div className="progress-card__head">
							<span className="metric-icon metric-icon--learned" aria-hidden="true">
								<LearnedIcon />
							</span>
						</div>
						<p className="progress-card__label">Tổng từ đã học</p>
						<p className="progress-card__value">{dashboard.totalLearned || 0} từ</p>
					</article>
					<article className="progress-card">
						<div className="progress-card__head">
							<span className="metric-icon metric-icon--review" aria-hidden="true">
								<ReviewIcon />
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
										{item.type === 'article' && <DocumentIcon />}
										{item.type === 'video' && <VideoIcon />}
										{item.type === 'tip' && <DiceIcon />}
										<h3 className="content-item__title">{item.title}</h3>
									</article>
								))}
							</div>
						</section>
					</div>

					{/* Right Sidebar */}
					<aside className="homepage__sidebar">
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
											<span className="pronunciation-text">{todayVocab.phoneticUK || todayVocab.phonetic}</span>
											<button className="pronunciation-btn" type="button" aria-label="Play UK pronunciation">
												<SpeakerIcon />
											</button>
										</div>
										<div className="pronunciation-item">
											<span className="pronunciation-label">US</span>
											<span className="pronunciation-text">{todayVocab.phoneticUS || todayVocab.phonetic}</span>
											<button className="pronunciation-btn" type="button" aria-label="Play US pronunciation">
												<SpeakerIcon />
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
										<BookmarkIcon />
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
