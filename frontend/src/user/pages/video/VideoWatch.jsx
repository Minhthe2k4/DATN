import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import FavoriteButton from '../../components/interaction/FavoriteButton'
import ProgressBar from '../../components/interaction/ProgressBar'
import HighlightWrapper from '../../components/interaction/HighlightWrapper'
import axios from 'axios'
import './videoWatch.css'
import '../../components/interaction/interaction.css'

// URL backend
const API_BASE = 'http://localhost:8080'

// Icon phát âm
const speakerIcon = (
	<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
		<path d="M11 5L6 9H2v6h4l5 4V5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
		<path d="M15.54 8.46a5 5 0 010 7.07M18.37 5.63a9 9 0 010 12.73" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
	</svg>
)

// Phát âm bằng Web Speech API
function speakWord(text, lang) {
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
	const [activeSubtitleId, setActiveSubtitleId] = useState(null) // Segment đang active (click hoặc theo giờ video)
	const [selectedWord, setSelectedWord] = useState(null)          // Từ đang xem trong từ điển
	const [showSaveModal, setShowSaveModal] = useState(false)
	const [saveFormData, setSaveFormData] = useState({
		word: '', pronunciation: '', definitionEng: '', definitionVi: '',
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
					fetch(`${API_BASE}/api/videos/${videoId}`),
					fetch(`${API_BASE}/api/videos/${videoId}/segments`),
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
					// Active segment đầu tiên mặc định
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
			const res = await axios.get('/api/user/interaction/stats', {
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
			const res = await axios.get('/api/user/vocab-custom/list', {
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
			const res = await axios.post('/api/user/interaction/favorite/toggle', null, {
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
			await axios.post('/api/user/interaction/progress', null, {
				params: { targetId: videoId, targetType: 'VIDEO', percent },
				headers: getAuthHeader()
			})
			setProgressPercent(percent)
		} catch (err) {
			console.error('Failed to update progress:', err)
		}
	}

	// ─── Đồng bộ phụ đề theo thời gian phát video ───────────────────────────────
	const handleTimeUpdate = () => {
		const el = videoRef.current
		if (!el || segments.length === 0) return

		const t = el.currentTime
		// Tìm segment đang được phát
		const found = segments.find((s) => t >= s.startSec && t <= s.endSec)
		if (found && found.id !== activeSubtitleId) {
			setActiveSubtitleId(found.id)
			// Tự động cuộn đến dòng phụ đề đang active
			const activeEl = document.getElementById(`subtitle-${found.id}`)
			if (activeEl) {
				activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
			}
		}
	}

	// Khi click một dòng phụ đề → tua video đến đúng thời điểm
	const handleClickSubtitle = (seg) => {
		setActiveSubtitleId(seg.id)
		if (videoRef.current) {
			videoRef.current.currentTime = seg.startSec
			videoRef.current.play()
			setIsPlaying(true) // Cập nhật trạng thái nút Play/Pause tùy chỉnh
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
					// Tự động cuộn đến dòng phụ đề đang active trong danh sách bên phải
					const activeEl = document.getElementById(`subtitle-${found.id}`)
					if (activeEl) {
						activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
					}
				}
			}

			// Theo dõi tiến độ xem (Progress Tracking)
			const duration = videoRef.current.duration
			if (duration > 0) {
				const percent = (time / duration) * 100
				if (percent > progressPercent + 2 || percent >= 99) {
					handleUpdateProgress(Math.min(percent, 100))
				}
			}
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
            pronunciation: 'Dang tra cuu...',
            definitionEng: '',
            definitionVi: '',
            contextTranslation: ''
        }));
        setShowSaveModal(true);

        try {
            const session = getUserSession();
            const res = await axios.post(`${API_BASE}/api/videos/lookup-word`, {
                userId: session?.userId ? Number(session.userId) : null,
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
                definitionEng: firstMeaning.definitionEn || '',
                definitionVi: firstMeaning.definitionVi || '',
                example: firstMeaning.example || '',
                exampleVi: data.contextTranslation || '',
                contextTranslation: data.contextTranslation || ''
            }));
        } catch (err) {
            console.error('Loi tra tu:', err);
            const errorMsg = err?.response?.data?.message || 'Khong the ket noi den may chu tra tu';
            alert(errorMsg);
            setShowSaveModal(false);
        } finally {
            setIsLookingUp(false);
        }
        fetchDecks();
    };

	const fetchDecks = async () => {
		try {
			const res = await fetch(`${API_BASE}/api/user/flashcards/decks`, {
				headers: getAuthHeader()
			})
			if (res.ok) setAvailableDecks(await res.json())
		} catch (err) {}
	}

	// ─── Modal lưu từ vựng ────────────────────────────────────────────────────────
	const handleOpenSaveModal = (word) => {
		setSaveFormData({ word, pronunciation: '', definitionEng: '', definitionVi: '' })
		setShowSaveModal(true)
	}

	const handleSaveWord = async () => {
		const session = getUserSession()
		const userId = Number(session?.userId)
		if (!userId) {
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
                userId: userId,
                word: saveFormData.word,
                pronunciation: saveFormData.pronunciation,
                partOfSpeech: saveFormData.partOfSpeech || 'noun',
                meaningEn: saveFormData.definitionEng,
                meaningVi: saveFormData.definitionVi,
                example: saveFormData.example,
                exampleVi: saveFormData.exampleVi,
                addToSRS: saveFormData.saveType === 'SRS',
                deckId: saveFormData.saveType === 'FLASHCARD' ? Number(saveFormData.deckId) : null
            }

            const res = await axios.post(`${API_BASE}/api/videos/save-word`, payload, {
                headers: getAuthHeader()
            })

            if (res.status === 200 || res.status === 201) {
                alert('Đã lưu từ vựng thành công!')
                setShowSaveModal(false)
                // Refresh vocab list to update highlights
                if (typeof fetchSavedVocab === 'function') fetchSavedVocab()
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
	const videoStreamUrl = video ? `${API_BASE}/api/videos/${video.id}/stream` : ''

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
										<button onClick={() => handleSkip(-10)} title="Lùi 10s">
											<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6c-1.66 0-3.15-.69-4.22-1.78L6.31 17.69C7.75 19.13 9.77 20 12 20c4.41 0 8-3.59 8-8s-3.59-8-8-8zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z"/></svg>
										</button>
										
										<button onClick={togglePlay} className="video-watch__play-btn">
											{isPlaying ? (
												<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
											) : (
												<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
											)}
										</button>

										<button onClick={() => handleSkip(10)} title="Tiến 10s">
											<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 3c4.97 0 9 4.03 9 9H23l-3.89 3.89-.07.14L15 12h3c0-3.31-2.69-6-6-6s-6 2.69-6 6 2.69 6 6 6c1.66 0 3.15-.69 4.22-1.78l1.47 1.47c-1.44 1.44-3.46 2.31-5.69 2.31-4.41 0-8-3.59-8-8s3.59-8 8-8zm1 5v5l-4.25 2.52-.77-1.28 3.52-2.09V8z"/></svg>
										</button>

										<span className="video-watch__time-display">
											{formatTime(currentTime)} / {formatTime(duration)}
										</span>
									</div>

									<div className="video-watch__controls-right">
										<div className="video-watch__speed-selector">
											<button className="video-watch__speed-btn">{playbackRate}x</button>
											<div className="video-watch__speed-options">
												{[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
													<button key={s} onClick={() => changeSpeed(s)} className={playbackRate === s ? 'is-active' : ''}>{s}x</button>
												))}
											</div>
										</div>
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
														<span className="dict-phonetic">{saveFormData.pronunciation}</span>
														<button className="dict-close" onClick={() => setShowSaveModal(false)}>×</button>
													</header>
													
													<div className="dict-body">
                                                        {isLookingUp ? (
                                                            <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Đang tra cứu từ điển AI...</p>
                                                        ) : (
                                                            <>
                                                                <div className="dict-section">
                                                                    <label>Nghĩa tiếng Anh</label>
                                                                    <p className="dict-text-en">{saveFormData.definitionEng || '...'}</p>
                                                                </div>
                                                                <div className="dict-section">
                                                                    <label>Nghĩa tiếng Việt</label>
                                                                    <p className="dict-text-vi">{saveFormData.definitionVi || '...'}</p>
                                                                </div>

                                                                {saveFormData.contextTranslation && (
                                                                    <div className="dict-section dict-context-section" style={{ backgroundColor: '#f0f9ff', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #0ea5e9' }}>
                                                                        <label style={{ color: '#0369a1' }}>Dịch ngữ cảnh</label>
                                                                        <p className="dict-context-text" style={{ fontSize: '0.9rem', color: '#0c4a6e' }}>{saveFormData.contextTranslation}</p>
                                                                    </div>
                                                                )}

                                                                {saveFormData.example && (
                                                                    <div className="dict-section dict-example-section">
                                                                        <label>Câu ví dụ (trong video)</label>
                                                                        <p className="dict-example-en">"{saveFormData.example}"</p>
                                                                    </div>
                                                                )}

                                                                <div className="dict-save-type-selector" style={{ marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                                        <label className="dict-save-option">
                                                                            <input 
                                                                                type="radio" 
                                                                                name="saveType" 
                                                                                value="SRS" 
                                                                                checked={saveFormData.saveType === 'SRS'} 
                                                                                onChange={(e) => setSaveFormData({...saveFormData, saveType: e.target.value})}
                                                                            />
                                                                            <span className="save-option-text">
                                                                                <strong>Học thông minh (SRS)</strong>
                                                                                <small>Gợi ý ôn tập theo lộ trình trí nhớ</small>
                                                                            </span>
                                                                        </label>
                                                                        <label className="dict-save-option">
                                                                            <input 
                                                                                type="radio" 
                                                                                name="saveType" 
                                                                                value="FLASHCARD" 
                                                                                checked={saveFormData.saveType === 'FLASHCARD'} 
                                                                                onChange={(e) => setSaveFormData({...saveFormData, saveType: e.target.value})}
                                                                            />
                                                                            <span className="save-option-text">
                                                                                <strong>Lưu vào Flashcard</strong>
                                                                                <small>Tự ôn tập trong bộ sưu tập cá nhân</small>
                                                                            </span>
                                                                        </label>
                                                                    </div>

                                                                    {saveFormData.saveType === 'FLASHCARD' && (
                                                                        <div style={{ marginTop: '1rem' }}>
                                                                            <select 
                                                                                className="dict-deck-select"
                                                                                value={saveFormData.deckId} 
                                                                                onChange={(e) => setSaveFormData({...saveFormData, deckId: e.target.value})}
                                                                                style={{ width: '100%', padding: '0.4rem', borderRadius: '0.3rem', border: '1px solid #ddd', fontSize: '0.85rem' }}
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
								: <span style={{ color: '#999' }}>{segments.length > 0 ? 'Đang chờ đến đoạn có phụ đề...' : 'Video này chưa có phụ đề'}</span>
							}
						</div>
					</div>

					{/* Cột phải: Danh sách phụ đề có thể click */}
					<aside className="video-watch__subtitles">
						<h2>Phụ đề ({segments.length})</h2>
						<div className="video-watch__subtitle-list">
							{segments.length === 0 ? (
								<p style={{ color: '#999', padding: '16px', textAlign: 'center' }}>
									Chưa có phụ đề.<br />
									<small>Video có thể đang được xử lý.</small>
								</p>
							) : segments.map((seg) => {
								// Format giờ phút giây: MM:SS
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

			{/* Modal cũ đã được thay thế bằng Quick Dictionary Panel ở trên */}
		</section>
	)
}

// Helper: Format giây thành mm:ss
function formatTime(seconds) {
	if (!seconds || isNaN(seconds)) return '0:00'
	const m = Math.floor(seconds / 60)
	const s = Math.floor(seconds % 60)
	return `${m}:${String(s).padStart(2, '0')}`
}
