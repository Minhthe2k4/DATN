import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import axios from 'axios'
import { modal } from '@/utils/modalUtils'
import { toast } from '@/utils/toastUtils'
import './videoWatch.css'

import { VideoWatchHeader } from './components/VideoWatchHeader'
import { VideoPlayer } from './components/VideoPlayer'
import { SubtitlePanel } from './components/SubtitlePanel'
import { AiDictionaryPanel } from './components/AiDictionaryPanel'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * Trang xem Video tích hợp học tiếng Anh.
 * Chức năng chính:
 * 1. Phát video (YouTube/Stream).
 * 2. Hiển thị phụ đề (Subtitle Panel) đồng bộ theo thời gian thực.
 * 3. Cho phép click vào từng từ trong phụ đề để tra cứu và lưu từ vựng (AiDictionaryPanel).
 */
export function VideoWatch() {
	const { channelSlug, videoId } = useParams()

	const [video, setVideo] = useState(null)
	const [channelName, setChannelName] = useState('')
	const [segments, setSegments] = useState([])
	const [isLoading, setIsLoading] = useState(true)

	const session = getUserSession()
	const userId = session?.userId ? Number(session.userId) : null
	const [progressPercent, setProgressPercent] = useState(0)
	const [savedVocab, setSavedVocab] = useState([])
	const [activeSubtitleId, setActiveSubtitleId] = useState(null)
	const [showSaveModal, setShowSaveModal] = useState(false)
	const [saveFormData, setSaveFormData] = useState({
		word: '', pronunciation: '', definitionEng: '', definitionVi: '', typeOfWord: ''
	})

	const videoRef = useRef(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [playbackRate, setPlaybackRate] = useState(1)
	const [volume, setVolume] = useState(1)
	const [isMuted, setIsMuted] = useState(false)
	const [showControls, setShowControls] = useState(true)
	const [isLookingUp, setIsLookingUp] = useState(false)

	const activeSegment = useMemo(() => {
		if (!segments || segments.length === 0) return null
		return segments.find((s) => s.id === activeSubtitleId)
			|| segments.find(s => currentTime >= s.startSec && currentTime <= s.endSec)
	}, [segments, activeSubtitleId, currentTime])

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
					setSegments(Array.isArray(segs) ? segs : [])
					if (segs.length > 0) setActiveSubtitleId(segs[0].id)
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
			setProgressPercent(res.data.progressPercent)
		} catch (err) {
			console.error('Failed to fetch stats:', err)
		}
	}

	const fetchSavedVocab = async () => {
		try {
			const res = await axios.get(`${API_BASE_URL}/api/user/vocab-custom/list`, { headers: getAuthHeader() })
			setSavedVocab(res.data || [])
		} catch (err) {
			console.error('Failed to fetch saved vocab:', err)
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

	const handleClickSubtitle = (seg) => {
		setActiveSubtitleId(seg.id)
		if (videoRef.current) {
			videoRef.current.currentTime = seg.startSec
			videoRef.current.play()
			setIsPlaying(true)
		}
	}

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
			if (segments.length > 0) {
				const found = segments.find((s) => time >= s.startSec && time <= s.endSec)
				if (found && found.id !== activeSubtitleId) {
					setActiveSubtitleId(found.id)
					const activeEl = document.getElementById(`subtitle-${found.id}`)
					if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
				}
			}
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
			setVolume(newMuted ? 0 : videoRef.current.volume || 1)
		}
	}

	const toggleFullscreen = () => {
		const container = videoRef.current?.parentElement
		if (!container) return
		if (!document.fullscreenElement) container.requestFullscreen()
		else document.exitFullscreen()
	}

	// Xử lý khi người dùng click vào một từ trong phụ đề video
	const handleWordClick = async (word, context) => {
		if (videoRef.current) {
			// Tạm dừng video để người dùng tập trung tra từ
			videoRef.current.pause()
			setIsPlaying(false)
		}
		setIsLookingUp(true)
		setSaveFormData(prev => ({
			...prev, word, pronunciation: 'Đang tra cứu...', definitionEng: '', definitionVi: '', contextTranslation: ''
		}))
		setShowSaveModal(true)
		try {
			const currentSession = getUserSession()
			const res = await axios.post(`${API_BASE_URL}/api/videos/lookup-word`, {
				userId: currentSession?.userId ? Number(currentSession.userId) : null,
				videoId: Number(videoId), word, sentence: context
			}, { headers: getAuthHeader() })
			const data = res.data
			const firstPronunciation = (data.pronunciations || []).find((item) => item?.ipa || item?.audio)
			const meanings = data.meanings || []
			const firstMeaning = meanings[0] || {}
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
			}))
			// Hiển thị Panel kết quả tra từ (AI Dictionary)
		} catch (err) {
			console.error('Lỗi tra từ:', err)
			const errorMsg = err?.response?.data?.message || 'Không thể kết nối đến máy chủ tra từ.'
			const isPremiumError = err?.response?.status === 403 ||
				errorMsg.toLowerCase().includes('premium') ||
				errorMsg.toLowerCase().includes('khóa') ||
				errorMsg.toLowerCase().includes('gói cước')

			setShowSaveModal(false)
			if (isPremiumError) {
				modal.premium(errorMsg)
			} else {
				toast.error(errorMsg)
			}
		} finally {
			setIsLookingUp(false)
		}
	}

	const handleSaveWord = async () => {
		if (!userId) {
			toast.warning('Vui lòng đăng nhập để lưu từ')
			return
		}
		try {
			const payload = {
				userId, word: saveFormData.word, pronunciation: saveFormData.pronunciation,
				typeOfWord: saveFormData.typeOfWord || 'noun', meaningEn: saveFormData.definitionEng,
				meaningVi: saveFormData.definitionVi, example: saveFormData.example,
				exampleVi: saveFormData.exampleVi, addToSRS: true,
			}
			await axios.post(`${API_BASE_URL}/api/videos/save-word`, payload, { headers: getAuthHeader() })
			toast.success('Đã lưu từ vựng thành công!')
			setShowSaveModal(false)
			fetchSavedVocab()
		} catch (err) {
			console.error('Lỗi lưu từ:', err)
			toast.error(err?.response?.data?.message || 'Không thể lưu từ vựng')
		}
	}

	if (isLoading) {
		return (
			<section className="video-watch-page">
				<div className="video-watch-page__container">
					<div className="video-loading">
						<div className="spinner"></div>
						<p>Đang tải video và phụ đề...</p>
					</div>
				</div>
			</section>
		)
	}

	if (!video) {
		return (
			<section className="video-watch-page">
				<div className="video-watch-page__container">
					<div className="video-error-container">
						<h1>Không tìm thấy video</h1>
						<p>Video không tồn tại hoặc chưa được xuất bản.</p>
						<Link to="/video" className="video-watch__back">Quay lại Video</Link>
					</div>
				</div>
			</section>
		)
	}

	const videoStreamUrl = `${API_BASE_URL}/api/videos/${video.id}/stream`

	return (
		<section className="video-watch-page">
			<div className="video-watch-page__container">
				<VideoWatchHeader
					video={video}
					channelSlug={channelSlug}
					channelName={channelName}
					progressPercent={progressPercent}
				/>

				<div className="video-watch__layout">
					<div className="video-watch__player-side">
						<VideoPlayer
							videoRef={videoRef}
							videoStreamUrl={videoStreamUrl}
							onTimeUpdate={handleVideoTimeUpdate}
							onMetadataLoaded={onMetadataLoaded}
							togglePlay={togglePlay}
							isPlaying={isPlaying}
							showControls={showControls}
							setShowControls={setShowControls}
							currentTime={currentTime}
							duration={duration}
							handleProgressChange={handleProgressChange}
							handleSkip={handleSkip}
							playbackRate={playbackRate}
							changeSpeed={changeSpeed}
							toggleMute={toggleMute}
							isMuted={isMuted}
							volume={volume}
							toggleFullscreen={toggleFullscreen}
						/>

						<div className="video-watch__line-preview">
							{activeSegment ? (
								<div className="video-watch__clickable-text-wrapper">
									<div className="video-watch__clickable-text">
										{(activeSegment.text || '').split(/(\s+)/).map((part, i) => {
											const cleanWord = part.trim().replace(/[.,!?;:()"]/g, '')
											if (cleanWord.length > 0) {
												const match = savedVocab.find(v => v.word.toLowerCase() === cleanWord.toLowerCase())
												return (
													<span
														key={i}
														className={`video-watch__word ${match ? 'highlighted-word' : ''}`}
														onClick={(e) => {
															e.stopPropagation()
															handleWordClick(cleanWord, activeSegment.text)
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
												)
											}
											return <span key={i}>{part}</span>
										})}
									</div>

									<AiDictionaryPanel
										show={showSaveModal}
										isLookingUp={isLookingUp}
										formData={saveFormData}
										onClose={() => setShowSaveModal(false)}
										onSave={handleSaveWord}
									/>
								</div>
							) : (
								<span className="video-watch__no-sub-msg">
									{segments.length > 0 ? 'Đang chờ đến đoạn có phụ đề...' : 'Video này chưa có phụ đề'}
								</span>
							)}
						</div>
					</div>

					<SubtitlePanel
						segments={segments}
						activeSubtitleId={activeSubtitleId}
						onSubtitleClick={handleClickSubtitle}
					/>
				</div>
			</div>
		</section>
	)
}
