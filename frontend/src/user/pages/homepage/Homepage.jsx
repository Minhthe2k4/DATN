import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import { toast } from '@/utils/toastUtils'
import {
	fetchDashboard,
	fetchNewsFeed,
	fetchSuggestedContent,
	fetchSuggestedVocab,
	fetchTodayVocab,
	fetchActivityCalendar
} from './homepage.api'
import { TodayFocus } from './components/TodayFocus'
import { SearchBar } from './components/SearchBar'
import { ProgressOverview } from './components/ProgressOverview'
import { HotSearch } from './components/HotSearch'
import { SuggestedContent } from './components/SuggestedContent'
import { StudyCalendar } from './components/StudyCalendar'
import { VocabCard } from './components/VocabCard'
import { NewsFeed } from './components/NewsFeed'
import './homepage.css'

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
	const [searchValue, setSearchValue] = useState('');

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

	const handleSaveWord = async (vocab, addToSRS = true) => {
		if (!isLoggedIn) {
			toast.warning('Vui lòng đăng nhập để lưu từ vựng');
			return;
		}
		if (!vocab || !vocab.word) return;

		try {
			const authToken = localStorage.getItem('token') || session?.userId;
			const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/user/vocab-custom/save`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...getAuthHeader()
				},
				body: JSON.stringify({
					word: vocab.word,
					pronunciation: vocab.phonetic || vocab.pronunciation || '',
					meaningEn: vocab.definition || vocab.meaningEn || '',
					meaningVi: vocab.meaningVi || 'Đang chờ dịch nghĩa...',
					example: vocab.example || '',
					exampleVi: vocab.exampleVi || '',
					addToSRS: addToSRS
				}),
			});

			if (!response.ok) {
				const errorMsg = await response.text();
				if (errorMsg === 'Từ đã được lưu' || errorMsg.includes('exists')) {
					toast.info('Từ này đã có trong lộ trình học của bạn rồi');
					return;
				}
				throw new Error(errorMsg || 'Failed to save');
			}

			toast.success(addToSRS ? 'Lưu từ vựng vào lộ trình Thời điểm vàng thành công!' : 'Đã đưa từ vựng vào kho từ đã biết!');
		} catch (err) {
			toast.error('Lỗi khi lưu từ vựng: ' + err.message);
		}
	}

	const playWordAudio = (word) => {
		if (!word || !('speechSynthesis' in window)) return;
		window.speechSynthesis.cancel();
		const utterance = new window.SpeechSynthesisUtterance(word);
		utterance.lang = 'en-US';
		window.speechSynthesis.speak(utterance);
	};

	const handleSearch = (word) => {
		if (word) {
			navigate(`/dictionary?word=${encodeURIComponent(word)}`);
		}
	};

	const handleContentClick = (item) => {
		if (item.type === 'article') {
			navigate(`/reading/${item.topicId || 0}/${item.id}`)
		} else if (item.type === 'video') {
			navigate(`/video/${item.channelSlug || 'youtube'}/watch/${item.id}`)
		}
	};

	return (
		<div className="homepage">
			<div className="homepage__container">
				<TodayFocus 
					isLoggedIn={isLoggedIn}
					dashboard={dashboard}
					onReview={() => navigate('/vocabulary')}
					onLearnNew={() => navigate('/vocabulary-lesson')}
					onManualAdd={() => navigate('/vocabulary-manager')}
					onRegister={() => navigate('/register')}
					onDictionary={() => navigate('/dictionary')}
				/>

				<SearchBar 
					value={searchValue}
					onChange={setSearchValue}
					onSearch={handleSearch}
				/>

				{isLoggedIn && <ProgressOverview dashboard={dashboard} />}

				<div className="homepage__content">
					<div className="homepage__main">
						<HotSearch 
							vocab={suggestedVocab}
							onTagClick={handleSearch}
						/>

						{isLoggedIn && (
							<div className="learning-banner" role="region" aria-label="Mục tiêu hôm nay">
								<div className="learning-banner__content">
									<p className="learning-banner__eyebrow">Mục tiêu hôm nay</p>
									<h3 className="learning-banner__title">Hoàn thành {dashboard.reviewCount || 0} từ ôn tập</h3>
									<p className="learning-banner__description">Giữ streak {dashboard.streak || 0} ngày bằng một phiên học ngắn 15-20 phút.</p>
								</div>
								<button className="learning-banner__button" type="button" onClick={() => navigate('/vocabulary')}>Bắt đầu phiên học</button>
							</div>
						)}

						<SuggestedContent 
							content={suggestedContent}
							onContentClick={handleContentClick}
						/>
					</div>

					<aside className="homepage__sidebar">
						{isLoggedIn && <StudyCalendar activityDates={activityDates} />}
						
						<VocabCard 
							vocab={todayVocab}
							onWordClick={handleSearch}
							onPlayAudio={playWordAudio}
							onSave={handleSaveWord}
						/>

						<NewsFeed news={newsFeed} />
					</aside>
				</div>
			</div>
		</div>
	)
}
