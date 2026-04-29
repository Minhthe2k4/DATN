import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import FavoriteButton from '../../components/interaction/FavoriteButton'
import ProgressBar from '../../components/interaction/ProgressBar'
import axios from 'axios'
import './videoWatch.css'
import '../../components/interaction/interaction.css'

import {
	Play,
	Pause,
	RotateCcw,
	RotateCw,
	Volume2,
	ChevronRight,
	ChevronLeft,
	Settings,
	X,
	VolumeX,
	Volume1,
	Maximize,
	HelpCircle,
	BookOpen
} from 'lucide-react'

// URL backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// Phát âm bằng Web Speech API
function speakWord(text, lang = 'en-US') {
	if (!('speechSynthesis' in window)) return
	window.speechSynthesis.cancel()
	const utterance = new SpeechSynthesisUtterance(text)
	utterance.lang = lang
	window.speechSynthesis.speak(utterance)
}

export function VideoWatch() {
	const { channelSlug, videoId } = useParams()

	// Dữ liệu từ API
	const [video, setVideo] = useState(null)
	const [channelName, setChannelName] = useState('')
	const [segments, setSegments] = useState([]) // Phụ đề từ Whisper
	const [isLoading, setIsLoading] = useState(true)

	// User interactions
	const session = getUserSession()
	const userId = session?.userId ? Number(session.userId) : null
	const [isFavorite, setIsFavorite] = useState(false)
	const [progressPercent, setProgressPercent] = useState(0)
	const [savedVocab, setSavedVocab] = useState([])
	const [interactionLoading, setInteractionLoading] = useState(false)

	// Trạng thái giao diện
	const [activeSubtitleId, setActiveSubtitleId] = useState(null)
	const [showSaveModal, setShowSaveModal] = useState(false)
	const [saveFormData, setSaveFormData] = useState({
		word: '', pronunciation: '', definitionEng: '', definitionVi: '',
		typeOfWord: '',
		saveType: 'SRS',
		deckId: '',
	})
	const [availableDecks, setAvailableDecks] = useState([])

	// Ref đến thẻ <video> HTML để điều khiển playback
	const videoRef = useRef(null)

	// Trạng thái điều khiển video tùy chỉnh
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [playbackRate, setPlaybackRate] = useState(1)
	const [volume, setVolume] = useState(1)
	const [isMuted, setIsMuted] = useState(false)
	const [showControls, setShowControls] = useState(true)
	const [isLookingUp, setIsLookingUp] = useState(false)
	const premiumStatus = usePremiumStatus(userId)

	// Segment đang active (hiển thị phía dưới player)
	const activeSegment = useMemo(() => {
		if (!segments || segments.length === 0) return null
		return segments.find((s) => s.id === activeSubtitleId)
			|| segments.find(s => currentTime >= s.startSec && currentTime <= s.endSec)
	}, [segments, activeSubtitleId, currentTime])

	// ─── Load video + segments từ API ───────────────────────────────────────────
	useEffect(() => {
		if (!videoId) return
		let cancelled = false

		async function loadVideo() {
			setIsLoading(true)
			try {
				const [videoRes, segmentsRes] = await Promise.all([
					fetch(`${API_BASE_URL}/api/videos/${videoId}`),
					fetch(`${API_BASE_URL}/api/videos/${videoId}/segments`),
				])

				if (cancelled) return

				if (videoRes.ok) {
					const data = await videoRes.json()
					setVideo(data)
					setChannelName(data.channelName ?? '')

					if (userId) {
						fetchInteractionStats()
						fetchSavedVocab()
					}
				}

				if (segmentsRes.ok) {
					const segs = await segmentsRes.json()
					const list = Array.isArray(segs) ? segs : []
					setSegments(list)
					if (list.length > 0) setActiveSubtitleId(list[0].id)
				}
			} catch (err) {
				console.error('Lỗi load video:', err)
			} finally {
				if (!cancelled) setIsLoading(false)
			}
		}

		loadVideo()
		return () => { cancelled = true }
	}, [videoId, userId])

	const fetchInteractionStats = async () => {
		try {
			const res = await axios.get(`${API_BASE_URL}/api/user/interaction/stats`, {
				params: { targetId: videoId, targetType: 'VIDEO' },
				headers: getAuthHeader()
			})
			setIsFavorite(res.data.isFavorite)
			setProgressPercent(res.data.progressPercent)
		} catch (err) {
			console.error('Failed to fetch stats:', err)
		}
	}

	const fetchSavedVocab = async () => {
		try {
			const res = await axios.get(`${API_BASE_URL}/api/user/vocab-custom/list`, {
				headers: getAuthHeader()
			})
			setSavedVocab(res.data || [])
		} catch (err) {
			console.error('Failed to fetch saved vocab:', err)
		}
	}

	const handleToggleFavorite = async () => {
		if (!userId) {
			alert('Vui lòng đăng nhập để sử dụng tính năng này!')
			return
		}
		setInteractionLoading(true)
		try {
			const res = await axios.post(`${API_BASE_URL}/api/user/interaction/favorite/toggle`, null, {
				params: { targetId: videoId, targetType: 'VIDEO' },
				headers: getAuthHeader()
			})
			setIsFavorite(res.data.isFavorite)
		} catch (err) {
			console.error('Failed to toggle favorite:', err)
		} finally {
			setInteractionLoading(false)
		}
	}

	const handleUpdateProgress = async (percent) => {
		if (!userId) return
		try {
			await axios.post(`${API_BASE_URL}/api/user/interaction/progress`, null, {
				params: { targetId: videoId, targetType: 'VIDEO', percent },
				headers: getAuthHeader()
			})
			setProgressPercent(percent)
		} catch (err) {
			console.error('Failed to update progress:', err)
		}
	}

	// Khi click một dòng phụ đề → tua video đến đúng thời điểm
	const handleClickSubtitle = (seg) => {
		setActiveSubtitleId(seg.id)
		if (videoRef.current) {
			videoRef.current.currentTime = seg.startSec
			videoRef.current.play()
			setIsPlaying(true)
		}
	}

	// ─── Logic điều khiển Video tùy chỉnh ────────────────────────────────────────
	const togglePlay = () => {
		const videoEl = videoRef.current
		if (!videoEl) return
		if (videoEl.paused) {
			videoEl.play()
			setIsPlaying(true)
		} else {
			videoEl.pause()
			setIsPlaying(false)
		}
	}

	const handleSkip = (seconds) => {
		if (videoRef.current) videoRef.current.currentTime += seconds
	}

	const changeSpeed = (speed) => {
		if (videoRef.current) {
			videoRef.current.playbackRate = speed
			setPlaybackRate(speed)
		}
	}

	const handleProgressChange = (e) => {
		const time = Number(e.target.value)
		if (videoRef.current) {
			videoRef.current.currentTime = time
			setCurrentTime(time)
		}
	}

	const onMetadataLoaded = () => {
		if (videoRef.current) setDuration(videoRef.current.duration)
	}

	const handleVideoTimeUpdate = () => {
		if (videoRef.current) {
			const time = videoRef.current.currentTime
			setCurrentTime(time)

			// Đồng bộ phụ đề (Subtitle Sync)
			if (segments.length > 0) {
				const found = segments.find((s) => time >= s.startSec && time <= s.endSec)
				if (found && found.id !== activeSubtitleId) {
					setActiveSubtitleId(found.id)
					const activeEl = document.getElementById(`subtitle-${found.id}`)
					if (activeEl) {
						activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
					}
				}
			}

			// Theo dõi tiến độ xem (Progress Tracking)
			const dur = videoRef.current.duration
			if (dur > 0) {
				const percent = (time / dur) * 100
				if (percent > progressPercent + 2 || percent >= 99) {
					handleUpdateProgress(Math.min(percent, 100))
				}
			}
		}
	}

	const toggleMute = () => {
		if (videoRef.current) {
			const newMuted = !isMuted
			videoRef.current.muted = newMuted
			setIsMuted(newMuted)
			if (newMuted) setVolume(0)
			else setVolume(videoRef.current.volume || 1)
		}
	}

	const toggleFullscreen = () => {
		const container = videoRef.current?.parentElement
		if (!container) return
		if (!document.fullscreenElement) {
			container.requestFullscreen().catch(err => console.error(err))
		} else {
			document.exitFullscreen()
		}
	}

	// ─── Logic tra từ điển AI ────────────────────────────────────────────────────
	const handleWordClick = async (word, context) => {
		if (videoRef.current) {
			videoRef.current.pause();
			setIsPlaying(false);
		}

		setIsLookingUp(true);
		setSaveFormData(prev => ({
			...prev,
			word,
			pronunciation: 'Đang tra cứu...',
			definitionEng: '',
			definitionVi: '',
			contextTranslation: ''
		}));
		setShowSaveModal(true);

		try {
			const currentSession = getUserSession();
			const res = await axios.post(`${API_BASE_URL}/api/videos/lookup-word`, {
				userId: currentSession?.userId ? Number(currentSession.userId) : null,
				videoId: Number(videoId),
				word: word,
				sentence: context
			}, {
				headers: getAuthHeader()
			});

			const data = res.data;
			const firstPronunciation = (data.pronunciations || []).find((item) => item?.ipa || item?.audio);
			const meanings = data.meanings || [];
			const firstMeaning = meanings[0] || {};

			setSaveFormData(prev => ({
				...prev,
				word: data.word || word,
				pronunciation: firstPronunciation?.ipa || '',
				level: data.level,
				typeOfWord: firstMeaning.typeOfWord || '',
				definitionEng: firstMeaning.definitionEn || '',
				definitionVi: firstMeaning.definitionVi || '',
				example: firstMeaning.example || '',
				exampleVi: data.contextTranslation || '',
				contextTranslation: data.contextTranslation || ''
			}));
		} catch (err) {
			console.error('Lỗi tra từ:', err);
			const errorMsg = err?.response?.data?.message || 'Không thể kết nối đến máy chủ tra từ. Vui lòng thử lại sau.';
			alert(errorMsg);
			setShowSaveModal(false);
		} finally {
			setIsLookingUp(false);
		}
		fetchDecks();
	};

	const fetchDecks = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/api/user/flashcards/decks`, {
				headers: getAuthHeader()
			})
			if (res.ok) setAvailableDecks(await res.json())
		} catch (err) {
			console.error('Failed to fetch decks:', err);
		}
	}

	const handleSaveWord = async () => {
		const currentSession = getUserSession()
		const currentUserId = Number(currentSession?.userId)
		if (!currentUserId) {
			alert('Vui lòng đăng nhập để lưu từ')
			return
		}

		if (saveFormData.saveType === 'FLASHCARD' && !saveFormData.deckId) {
			alert('Vui lòng chọn bộ thẻ để lưu!')
			return
		}

		// Kiểm tra Premium nếu lưu vào SRS
		if (saveFormData.saveType === 'SRS') {
			const vocabLimit = premiumStatus?.featureLimits?.SAVED_VOCABULARY
			const canSaveSRS = premiumStatus?.isPremium || (vocabLimit && !vocabLimit.IS_LOCKED)

			if (!canSaveSRS) {
				alert('✨ Tính năng lưu vào lộ trình SRS yêu cầu gói Premium. Bạn có thể chọn lưu vào Flashcard để thay thế!')
				return
			}
		}

		try {
			const payload = {
				userId: currentUserId,
				word: saveFormData.word,
				pronunciation: saveFormData.pronunciation,
				typeOfWord: saveFormData.typeOfWord || 'noun',
				meaningEn: saveFormData.definitionEng,
				meaningVi: saveFormData.definitionVi,
				example: saveFormData.example,
				exampleVi: saveFormData.exampleVi,
				addToSRS: saveFormData.saveType === 'SRS',
				deckId: saveFormData.saveType === 'FLASHCARD' ? Number(saveFormData.deckId) : null
			}

			const res = await axios.post(`${API_BASE_URL}/api/videos/save-word`, payload, {
				headers: getAuthHeader()
			})

			if (res.status === 200 || res.status === 201) {
				alert('Đã lưu từ vựng thành công!')
				setShowSaveModal(false)
				fetchSavedVocab()
			}
		} catch (err) {
			console.error('Lỗi lưu từ:', err)
			const errorMsg = err?.response?.data?.message || 'Không thể lưu từ vựng'
			alert(errorMsg)
		}
	}

	// ─── Render ───────────────────────────────────────────────────────────────────
	if (isLoading) {
		return (
			<section className="video-watch-page">
				<div className="video-watch-page__container">
					<p>Đang tải video...</p>
				</div>
			</section>
		)
	}

	if (!video) {
		return (
			<section className="video-watch-page">
				<div className="video-watch-page__container">
					<h1>Không tìm thấy video</h1>
					<p>Video không tồn tại hoặc chưa được xuất bản.</p>
					<Link to="/video" className="video-watch__back">Quay lại Video</Link>
				</div>
			</section>
		)
	}

	// URL để stream file video từ backend
	const videoStreamUrl = video ? `${API_BASE_URL}/api/videos/${video.id}/stream` : ''

	return (
		<section className="video-watch-page">
			<div className="video-watch-page__container">
				{/* Breadcrumb + tiêu đề */}
				<div className="video-watch__sticky-head">
					<nav className="video-watch__breadcrumb" aria-label="Điều hướng breadcrumb">
						<Link to="/">Trang chủ</Link>
						<span>/</span>
						<Link to="/video">Video</Link>
						<span>/</span>
						<Link to={`/video/${channelSlug}`}>{channelName}</Link>
						<span>/</span>
						<strong>{video.title}</strong>
					</nav>

					<header className="video-watch__header">
						<h1>{video.title}</h1>
						<div className="video-watch__meta-row">
							<span className="video-watch__dot" aria-hidden="true" />
							<span>{channelName}</span>
							<span> | </span>
							<span className="video-difficulty-badge">{video.difficulty}</span>
						</div>
						<div className="video-watch__actions">
							<FavoriteButton
								isFavorite={isFavorite}
								onToggle={handleToggleFavorite}
								loading={interactionLoading}
							/>
							<ProgressBar percent={progressPercent} label="Tiến độ xem" />
						</div>
					</header>
				</div>

				{/* Layout chính: player bên trái, phụ đề bên phải */}
				<div className="video-watch__layout">
					{/* Cột trái: Video player */}
					<div className="video-watch__player-side">
						<div
							className="video-watch__player-container"
							onMouseEnter={() => setShowControls(true)}
							onMouseLeave={() => isPlaying && setShowControls(false)}
						>
							<video
								ref={videoRef}
								src={videoStreamUrl}
								onTimeUpdate={handleVideoTimeUpdate}
								onLoadedMetadata={onMetadataLoaded}
								onClick={togglePlay}
								className="video-watch__video-element"
							>
								Trình duyệt không hỗ trợ video.
							</video>

							{/* Custom Controls Overlay */}
							<div className={`video-watch__controls ${showControls ? 'is-visible' : 'is-hidden'}`}>
								{/* Progress Bar */}
								<div className="video-watch__progress-container">
									<input
										type="range" min="0" max={duration} step="0.1"
										value={currentTime} onChange={handleProgressChange}
										className="video-watch__progress-bar"
									/>
								</div>

								<div className="video-watch__controls-main">
									<div className="video-watch__controls-left">
										<button onClick={() => handleSkip(-10)} className="video-watch__skip-btn" title="Lùi 10s">
											<RotateCcw size={20} />
										</button>

										<button onClick={togglePlay} className="video-watch__play-btn">
											{isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
										</button>

										<button onClick={() => handleSkip(10)} className="video-watch__skip-btn" title="Tiến 10s">
											<RotateCw size={20} />
										</button>

										<span className="video-watch__time-display">
											{formatTime(currentTime)} / {formatTime(duration)}
										</span>
									</div>

									<div className="video-watch__controls-right">
										<button onClick={toggleMute} className="video-watch__volume-btn" title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}>
											{isMuted ? <VolumeX size={20} /> : volume > 0.5 ? <Volume2 size={20} /> : <Volume1 size={20} />}
										</button>

										<div className="video-watch__speed-selector">
											<button className="video-watch__speed-btn">{playbackRate}x</button>
											<div className="video-watch__speed-options">
												{[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
													<button key={s} onClick={() => changeSpeed(s)} className={playbackRate === s ? 'is-active' : ''}>{s}x</button>
												))}
											</div>
										</div>

										<button onClick={toggleFullscreen} className="video-watch__fullscreen-btn" title="Toàn màn hình">
											<Maximize size={20} />
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* Dòng phụ đề đang hiển thị (lớn, phía dưới player) */}
						<div className="video-watch__line-preview">
							{activeSegment
								? (
									<div className="video-watch__clickable-text-wrapper">
										<div className="video-watch__clickable-text">
											{(activeSegment.text || '').split(/(\s+)/).map((part, i) => {
												const cleanWord = part.trim().replace(/[.,!?;:()"]/g, '');
												if (cleanWord.length > 0) {
													const match = savedVocab.find(v => v.word.toLowerCase() === cleanWord.toLowerCase());
													return (
														<span
															key={i}
															className={`video-watch__word ${match ? 'highlighted-word' : ''}`}
															onClick={(e) => {
																e.stopPropagation();
																handleWordClick(cleanWord, activeSegment.text);
															}}
														>
															{part}
															{match && (
																<span className="vocab-tooltip">
																	<span className="tooltip-word">{match.word} {match.pronunciation ? `[${match.pronunciation}]` : ''}</span>
																	<span className="tooltip-meaning">{match.meaningVi || match.meaningEn}</span>
																</span>
															)}
														</span>
													);
												}
												return <span key={i}>{part}</span>;
											})}
										</div>

										{/* Quick Dictionary Panel hiện ngay bên dưới */}
										{showSaveModal && (
											<div className="video-watch__quick-dict">
												<div className="video-watch__dict-arrow"></div>
												<div className="video-watch__dict-content">
													<header>
														<div className="dict-title-row">
															<h3>{saveFormData.word}</h3>
															{saveFormData.level && <span className="dict-level">{saveFormData.level}</span>}
														</div>
														<div className="dict-header-actions">
															<button className="dict-speak" onClick={() => speakWord(saveFormData.word)} title="Phát âm">
																<Volume2 size={18} />
															</button>
															<span className="dict-phonetic">{saveFormData.pronunciation}</span>
															<button className="dict-close" onClick={() => setShowSaveModal(false)}>
																<X size={20} />
															</button>
														</div>
													</header>

													<div className="dict-body">
														{isLookingUp ? (
															<div className="dict-loading">
																<div className="dict-spinner"></div>
																<p>Đang tra cứu từ điển AI...</p>
															</div>
														) : (
															<>
																<div className="dict-section">
																	<label><BookOpen size={14} /> Nghĩa tiếng Anh</label>
																	<p className="dict-text-en">{saveFormData.definitionEng || '...'}</p>
																</div>
																<div className="dict-section">
																	<label>🇻🇳 Nghĩa tiếng Việt</label>
																	<p className="dict-text-vi">{saveFormData.definitionVi || '...'}</p>
																</div>

																{saveFormData.contextTranslation && (
																	<div className="dict-section dict-context-section">
																		<label>Dịch ngữ cảnh</label>
																		<p className="dict-context-text">{saveFormData.contextTranslation}</p>
																	</div>
																)}

																{saveFormData.example && (
																	<div className="dict-section dict-example-section">
																		<label>Ví dụ minh họa</label>
																		<p className="dict-example-en">"{saveFormData.example}"</p>
																	</div>
																)}

																<div className="dict-save-type-selector">
																	<div className="save-options-grid">
																		<label className="dict-save-option">
																			<input
																				type="radio"
																				name="saveType"
																				value="SRS"
																				checked={saveFormData.saveType === 'SRS'}
																				onChange={(e) => setSaveFormData({ ...saveFormData, saveType: e.target.value })}
																			/>
																			<span className="save-option-text">
																				<strong>Học thông minh (SRS)</strong>
																				<small>Lộ trình ôn tập khoa học</small>
																			</span>
																		</label>
																		<label className="dict-save-option">
																			<input
																				type="radio"
																				name="saveType"
																				value="FLASHCARD"
																				checked={saveFormData.saveType === 'FLASHCARD'}
																				onChange={(e) => setSaveFormData({ ...saveFormData, saveType: e.target.value })}
																			/>
																			<span className="save-option-text">
																				<strong>Flashcard</strong>
																				<small>Tự ôn tập theo bộ thẻ</small>
																			</span>
																		</label>
																	</div>

																	{saveFormData.saveType === 'FLASHCARD' && (
																		<div className="deck-select-container">
																			<select
																				className="dict-deck-select"
																				value={saveFormData.deckId}
																				onChange={(e) => setSaveFormData({ ...saveFormData, deckId: e.target.value })}
																			>
																				<option value="">-- Chọn bộ thẻ --</option>
																				{availableDecks.map(deck => (
																					<option key={deck.id} value={deck.id}>{deck.name}</option>
																				))}
																			</select>
																		</div>
																	)}
																</div>
															</>
														)}
													</div>

													{!isLookingUp && (
														<div className="dict-footer">
															<button onClick={handleSaveWord} className="dict-save-btn">Lưu vào sổ tay cá nhân</button>
														</div>
													)}
												</div>
											</div>
										)}
									</div>
								)
								: <span className="video-watch__no-sub-msg">{segments.length > 0 ? 'Đang chờ đến đoạn có phụ đề...' : 'Video này chưa có phụ đề'}</span>
							}
						</div>
					</div>

					{/* Cột phải: Danh sách phụ đề có thể click */}
					<aside className="video-watch__subtitles">
						<header className="subtitles-header">
							<h2>Phụ đề ({segments.length})</h2>
							<Settings size={18} className="sub-settings-icon" />
						</header>
						<div className="video-watch__subtitle-list">
							{segments.length === 0 ? (
								<div className="subtitles-empty">
									<HelpCircle size={40} />
									<p>Chưa có phụ đề.<br /><small>Video có thể đang được xử lý.</small></p>
								</div>
							) : segments.map((seg) => {
								const mins = Math.floor(seg.startSec / 60)
								const secs = String(Math.floor(seg.startSec % 60)).padStart(2, '0')
								return (
									<button
										key={seg.id}
										id={`subtitle-${seg.id}`}
										type="button"
										onClick={() => handleClickSubtitle(seg)}
										className={`video-watch__subtitle-item${activeSubtitleId === seg.id ? ' is-active' : ''}`}
									>
										<span className="video-watch__subtitle-time">{mins}:{secs}</span>
										<span className="video-watch__subtitle-text">{seg.text}</span>
									</button>
								)
							})}
						</div>
					</aside>
				</div>
			</div>
		</section>
	)
}

function formatTime(seconds) {
	if (!seconds || isNaN(seconds)) return '0:00'
	const m = Math.floor(seconds / 60)
	const s = Math.floor(seconds % 60)
	return `${m}:${String(s).padStart(2, '0')}`
}
