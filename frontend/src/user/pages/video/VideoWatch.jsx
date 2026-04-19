import { useMemo, useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import { fetchVideoById } from '../../utils/videoApi'
import './videoWatch.css'

const LEVELS = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const VOCABULARY = {}
const SUBTITLES = []

const speakerIcon = (
	<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
		<path d="M11 5L6 9H2v6h4l5 4V5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
		<path d="M15.54 8.46a5 5 0 010 7.07M18.37 5.63a9 9 0 010 12.73" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
	</svg>
)

const bookmarkIcon = (
	<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
		<path d="M5 3h14v18l-7-4-7 4V3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
	</svg>
)

function speakWord(text, lang) {
	if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
		return
	}

	window.speechSynthesis.cancel()
	const utterance = new SpeechSynthesisUtterance(text)
	utterance.lang = lang
	window.speechSynthesis.speak(utterance)
}

/**
 * Extract YouTube video ID từ URL
 * Support: 
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 */
function extractYoutubeId(url) {
	if (!url) return null
	
	// Format: https://www.youtube.com/watch?v=ID
	const youtubeMatch = url.match(/youtube\.com\/watch\?v=([^&\n?#]+)/)
	if (youtubeMatch) return youtubeMatch[1]
	
	// Format: https://youtu.be/ID
	const shortMatch = url.match(/youtu\.be\/([^&\n?#]+)/)
	if (shortMatch) return shortMatch[1]
	
	return null
}

/**
 * Parse text thành segments, highlight vocabulary words
 * Input: "Hello everybody, welcome to the channel"
 * Output: ['Hello ', { word: 'everybody' }, ', welcome to the ', { word: 'channel' }]
 */
function parseSegmentsWithVocabulary(text) {
	if (!text) return []

	const segments = []
	let currentText = ''

	// Split text thành words
	const words = text.split(/(\s+)/) // Giữ lại spaces

	for (const w of words) {
		const wordLower = w.toLowerCase()

		// Kiểm tra word có trong VOCABULARY không (bỏ dấu câu)
		const cleanWord = wordLower.replace(/[.,!?;:'"]/g, '')

		if (VOCABULARY[cleanWord]) {
			// Có trong vocabulary → tạo segment riêng
			if (currentText) {
				segments.push(currentText)
				currentText = ''
			}
			segments.push({ word: cleanWord })
		} else {
			// Không → thêm vào currentText
			currentText += w
		}
	}

	// Thêm phần text cuối cùng
	if (currentText) {
		segments.push(currentText)
	}

	return segments
}

export function VideoWatch() {
	const { channelSlug, videoId } = useParams()
	const session = getUserSession()
	const userId = session?.userId ? Number(session.userId) : null
	const premiumStatus = usePremiumStatus(userId)
	
	const [video, setVideo] = useState(null)
	const [channel, setChannel] = useState(null)
	const [videoLoading, setVideoLoading] = useState(true)
	const [videoError, setVideoError] = useState(null)
	const [selectedLevel, setSelectedLevel] = useState('ALL')
	const [activeSubtitleId, setActiveSubtitleId] = useState(null)
	const [selectedWord, setSelectedWord] = useState(null)
	const [showSaveModal, setShowSaveModal] = useState(false)
	const [saveFormData, setSaveFormData] = useState({
		word: '',
		phonetic: '',
		definitionEng: '',
		definitionVi: '',
		exampleEng: '',
		exampleVi: '',
	})
	const [saveLoading, setSaveLoading] = useState(false)

	// Tải video từ backend API
	useEffect(() => {
		const loadVideo = async () => {
			try {
				setVideoLoading(true)
				const data = await fetchVideoById(videoId)
				console.log('DEBUG: API response data =', data)
				
				// Tạo object channel từ video data
				const channelObj = {
					id: data.channelId,
					slug: channelSlug,
					name: data.channelName,
					handle: data.channelName,
					videoList: []
				}
				
				// Transform video data
				const videoObj = {
					id: data.id,
					title: data.title,
					age: '—',
					duration: data.duration || '—',
					thumbnail: `http://img.youtube.com/vi/${extractYoutubeId(data.youtubeUrl)}/maxresdefault.jpg`,
					youtubeUrl: data.youtubeUrl,
					difficulty: data.difficulty || 'Trung bình',
					transcript: data.transcript || '',
					wordsHighlighted: data.wordsHighlighted || 0
				}
				
				setChannel(channelObj)
				setVideo(videoObj)
				setVideoError(null)
			} catch (err) {
				console.error('Failed to load video:', err)
				setVideoError('Không tìm thấy video này trong hệ thống.')
			} finally {
				setVideoLoading(false)
			}
		}

		if (videoId) {
			loadVideo()
		}
	}, [videoId, channelSlug])

	// Tạo subtitles từ transcript hoặc dùng mặc định
	const generatedSubtitles = useMemo(() => {
		console.log('DEBUG: video?.transcript =', video?.transcript)
		if (!video?.transcript || video.transcript.trim() === '') {
			// Nếu không có transcript, trả về rỗng thay vì dùng prototype data
			return []
		}

		// Parse transcript thành subtitles
		// Nếu transcript dính liền không có \n, tách theo dấu câu
		let lines = []
		if (video.transcript.includes('\n')) {
			lines = video.transcript.split('\n')
		} else {
			lines = video.transcript.match(/[^.!?]+[.!?]+/g) || [video.transcript]
		}
		
		lines = lines.filter(line => line.trim() !== '').slice(0, 20)

		return lines.map((line, idx) => {
			// Tạo timestamp giả (XX:YY format)
			const minutes = Math.floor((idx * 3) / 60)
			const seconds = (idx * 3) % 60
			const time = `${minutes}:${seconds.toString().padStart(2, '0')}`

			// Parse segments: tách text thành segments với highlight words
			const segments = parseSegmentsWithVocabulary(line.trim())

			return {
				id: idx + 1,
				time,
				segments
			}
		})
	}, [video?.transcript])

	// Set activeSubtitleId từ generatedSubtitles
	useEffect(() => {
		if (generatedSubtitles && generatedSubtitles.length > 0) {
			setActiveSubtitleId(generatedSubtitles[0].id)
		}
	}, [generatedSubtitles])

	// Filter subtitles theo level
	const subtitleRows = useMemo(() => {
		return generatedSubtitles.filter((line) => {
			if (selectedLevel === 'ALL') {
				return true
			}

			return line.segments.some((part) => typeof part !== 'string' && VOCABULARY[part.word]?.level === selectedLevel)
		})
	}, [selectedLevel, generatedSubtitles])

	const handleDownloadTranscript = () => {
		if (!premiumStatus?.isPremium) {
			alert('📥 Tải phụ đề yêu cầu đăng ký Premium. Nâng cấp ngay để tải và học offline!')
			return
		}

		if (!video) return

		// Create transcript content
		const content = `${video.title}\n${'='.repeat(video.title.length)}\n\nKênh: ${video.channel || 'Unknown'}\nKhó độ: ${video.difficulty || 'Trung bình'}\n\n${video.transcript || 'No transcript available'}`

		// Create blob and download
		const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = `${video.title.slice(0, 50).replace(/[^a-z0-9]/gi, '_')}_transcript.txt`
		link.click()
		URL.revokeObjectURL(link.href)
	}

	const handleOpenSaveModal = (meaning) => {
		if (!selectedWord) {
			return
		}

		setSaveFormData({
			word: selectedWord.word,
			phonetic: selectedWord.uk,
			definitionEng: meaning.definitionEn || '',
			definitionVi: meaning.explanationVi || '',
			exampleEng: meaning.examples[0] || '',
			exampleVi: '',
		})
		setShowSaveModal(true)
	}

	const handleCloseSaveModal = () => {
		setShowSaveModal(false)
	}

	const handleSaveFormChange = (field, value) => {
		setSaveFormData((prev) => ({
			...prev,
			[field]: value,
		}))
	}

	const handleSaveWord = async () => {
		if (!userId) {
			alert('Vui lòng đăng nhập để lưu từ vựng')
			return
		}
		
		setSaveLoading(true)
		try {
			const authToken = localStorage.getItem('token') || userId;
			const response = await fetch('/api/user/vocab-custom/save', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authToken}`
				},
				body: JSON.stringify({
					word: saveFormData.word,
					phonetic: saveFormData.phonetic,
					meaningEn: saveFormData.definitionEng,
					meaningVi: saveFormData.definitionVi,
					example: saveFormData.exampleEng,
					exampleVi: saveFormData.exampleVi,
				}),
			})

			if (!response.ok) {
				const errorMsg = await response.text()
				throw new Error(errorMsg || 'Failed to save word')
			}

			alert('Lưu từ vựng thành công! Từ này sẽ được lên lịch ôn tập theo thuật toán Spaced Repetition.')
			setShowSaveModal(false)
		} catch (err) {
			console.error('Save error:', err)
			alert('Lỗi: ' + err.message)
		} finally {
			setSaveLoading(false)
		}
	}

	if (videoLoading) {
		return (
			<section className="video-watch-page">
				<div className="video-watch-page__container">
					<div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
						<p>Đang tải video...</p>
					</div>
				</div>
			</section>
		)
	}

	if (!channel || !video || videoError) {
		return (
			<section className="video-watch-page">
				<div className="video-watch-page__container">
					<h1>Không tìm thấy video</h1>
					<p>{videoError || 'Hãy mở một kênh trước và chọn video hợp lệ.'}</p>
					<Link to="/video" className="video-watch__back">Quay lại Video</Link>
				</div>
			</section>
		)
	}

	return (
		<section className="video-watch-page">
			<div className="video-watch-page__container">
				<div className="video-watch__sticky-head">
					<nav className="video-watch__breadcrumb" aria-label="Điều hướng breadcrumb">
						<Link to="/">Trang chủ</Link>
						<span>/</span>
						<Link to="/video">Video</Link>
						<span>/</span>
						<Link to={`/video/${channel.slug}`}>{channel.name}</Link>
						<span>/</span>
						<strong>{video.title}</strong>
					</nav>

					<header className="video-watch__header">
						<h1>{video.title}</h1>
						<div className="video-watch__meta-row">
							<span className="video-watch__dot" aria-hidden="true" />
							<span>{channel.name}</span>
							{LEVELS.slice(1).map((level) => (
								<button
									key={level}
									type="button"
									onClick={() => setSelectedLevel(level)}
									className={`video-watch__level${selectedLevel === level ? ' is-active' : ''}`}
								>
									{level}
								</button>
							))}
							<button
								type="button"
								onClick={() => setSelectedLevel('ALL')}
								className={`video-watch__level${selectedLevel === 'ALL' ? ' is-active' : ''}`}
							>
								Tất cả
							</button>
							<span className="video-watch__dot" aria-hidden="true" />
							<button
								type="button"
								onClick={handleDownloadTranscript}
								className="video-watch__download-btn"
								title={premiumStatus?.isPremium ? 'Tải phụ đề' : 'Chỉ thành viên Premium có thể tải'}
							>
								{premiumStatus?.isPremium ? '📥 Tải phụ đề' : '🔒 Tải'}
							</button>
						</div>
					</header>
				</div>

				<div className="video-watch__layout">
					<div className="video-watch__player-side">
						<div className="video-watch__player">
							{video.youtubeUrl ? (
								<iframe
									width="100%"
									height="500"
									src={`https://www.youtube.com/embed/${extractYoutubeId(video.youtubeUrl)}?controls=1&modestbranding=1`}
									title={video.title}
									frameBorder="0"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
									style={{ borderRadius: '8px' }}
								/>
							) : (
								<div style={{
									width: '100%',
									height: '500px',
									backgroundColor: '#f0f0f0',
									borderRadius: '8px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: '18px',
									color: '#666'
								}}>
									Không có link video
								</div>
							)}
						</div>
						<div className="video-watch__line-preview">
							{activeSubtitleId && subtitleRows.find((line) => line.id === activeSubtitleId)?.segments.map((segment, idx) => {
								if (typeof segment === 'string') {
									return <span key={idx}>{segment}</span>
								}

								const vocab = VOCABULARY[segment.word]
								if (!vocab) {
									return null
								}

								const isDimmed = selectedLevel !== 'ALL' && vocab.level !== selectedLevel
								const isSelected = selectedWord?.word === vocab.word
								return (
									<button
										key={idx}
										type="button"
										onClick={() => setSelectedWord(vocab)}
										className={`video-watch__word${isDimmed ? ' is-dimmed' : ''}${isSelected ? ' is-selected' : ''}`}
									>
										{vocab.word}
									</button>
								)
							})}
						</div>
					</div>

					<aside className="video-watch__subtitles">
						<h2>Phụ đề ({subtitleRows.length})</h2>
						<div className="video-watch__subtitle-list">
							{subtitleRows && subtitleRows.length > 0 ? (
								subtitleRows.map((line) => (
								<button
									key={line.id}
									type="button"
									onClick={() => setActiveSubtitleId(line.id)}
									className={`video-watch__subtitle-item${activeSubtitleId === line.id ? ' is-active' : ''}`}
								>
									<span className="video-watch__subtitle-time">{line.time}</span>
									<span>
										{line.segments.map((segment, idx) => {
											if (typeof segment === 'string') {
												return <span key={idx}>{segment}</span>
											}

											const vocab = VOCABULARY[segment.word]
											if (!vocab) {
												return null
											}

											const isDimmed = selectedLevel !== 'ALL' && vocab.level !== selectedLevel
											const isSelected = selectedWord?.word === vocab.word
											return (
												<span
													key={idx}
													onClick={(event) => {
														event.stopPropagation()
														setSelectedWord(vocab)
													}}
													className={`video-watch__word video-watch__word--inline${isDimmed ? ' is-dimmed' : ''}${isSelected ? ' is-selected' : ''}`}
													style={{ cursor: 'pointer' }}
													role="button"
													tabIndex={0}
												>
													{vocab.word}
												</span>
											)
										})}
									</span>
								</button>
							))
							) : (
								<div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
									Không có phụ đề
								</div>
							)}
						</div>
					</aside>
				</div>
			</div>

			{selectedWord ? (
				<div className="dictionary-modal" role="dialog" aria-modal="true">
					<button type="button" className="dictionary-modal__backdrop" onClick={() => setSelectedWord(null)} aria-label="Đóng từ điển" />
					<div className="dictionary-modal__content">
						<div className="dictionary-modal__header">
							<div>
								<h2>{selectedWord.word}</h2>
								<span className="dict-pill">{selectedWord.level}</span>
							</div>
							<button type="button" className="dictionary-close" onClick={() => setSelectedWord(null)}>
								Đóng
							</button>
						</div>

						<div className="dict-pronunciation-list">
							<div className="dict-pronunciation-row">
								<strong>UK</strong>
								<button type="button" className="dict-speak-btn" onClick={() => speakWord(selectedWord.word, 'en-GB')} aria-label="Phát âm UK">
									{speakerIcon}
								</button>
								<span>{selectedWord.uk}</span>
							</div>
							<div className="dict-pronunciation-row">
								<strong>US</strong>
								<button type="button" className="dict-speak-btn" onClick={() => speakWord(selectedWord.word, 'en-US')} aria-label="Phát âm US">
									{speakerIcon}
								</button>
								<span>{selectedWord.us}</span>
							</div>
						</div>

						<div className="dict-meanings-block">
							{selectedWord.meanings.map((meaning, index) => (
								<article key={meaning.id} className="dict-meaning-row" style={{ '--stagger-index': index }}>
									<div className="dict-meaning-row__title">
										<div className="dict-meaning-row__head">
											<span className="dict-pill">{selectedWord.level}</span>
											<strong>{meaning.definitionEn}</strong>
										</div>
										<button type="button" className="dict-save-icon" aria-label="Lưu từ" onClick={() => handleOpenSaveModal(meaning)}>
											{bookmarkIcon}
										</button>
									</div>
									{meaning.explanationVi && <p className="dict-meaning-vi">{meaning.explanationVi}</p>}
									{meaning.examples.length > 0 && (
										<ul className="dict-examples">
											{meaning.examples.map((example, i) => (
												<li key={i}>{example}</li>
											))}
										</ul>
									)}
								</article>
							))}
						</div>
					</div>
				</div>
			) : null}

			{showSaveModal && (
				<div className="video-save-modal-overlay" onClick={handleCloseSaveModal}>
					<div className="video-save-modal" onClick={(event) => event.stopPropagation()}>
						<h2 className="video-save-modal__title">Lưu từ vựng</h2>

						<div className="video-save-modal__form">
							<div className="video-save-form__group">
								<label>Từ tiếng Anh</label>
								<input type="text" value={saveFormData.word} onChange={(e) => handleSaveFormChange('word', e.target.value)} placeholder="Từ tiếng Anh" />
							</div>

							<div className="video-save-form__group">
								<label>Phiên âm</label>
								<input type="text" value={saveFormData.phonetic} onChange={(e) => handleSaveFormChange('phonetic', e.target.value)} placeholder="e.g., /əˈkiːt/" />
							</div>

							<div className="video-save-form__group">
								<label>Định nghĩa (Tiếng Anh)</label>
								<textarea value={saveFormData.definitionEng} onChange={(e) => handleSaveFormChange('definitionEng', e.target.value)} placeholder="Định nghĩa tiếng Anh" rows="3" />
							</div>

							<div className="video-save-form__group">
								<label>Định nghĩa (Tiếng Việt)</label>
								<textarea value={saveFormData.definitionVi} onChange={(e) => handleSaveFormChange('definitionVi', e.target.value)} placeholder="Định nghĩa tiếng Việt" rows="3" />
							</div>

							<div className="video-save-form__group">
								<label>Ví dụ (Tiếng Anh)</label>
								<textarea value={saveFormData.exampleEng} onChange={(e) => handleSaveFormChange('exampleEng', e.target.value)} placeholder="Ví dụ tiếng Anh" rows="2" />
							</div>

							<div className="video-save-form__group">
								<label>Ví dụ (Tiếng Việt)</label>
								<textarea value={saveFormData.exampleVi} onChange={(e) => handleSaveFormChange('exampleVi', e.target.value)} placeholder="Ví dụ tiếng Việt" rows="2" />
							</div>
						</div>

						<div className="video-save-modal__actions">
							<button type="button" className="video-save-modal__btn video-save-modal__btn--cancel" onClick={handleCloseSaveModal}>
								Hủy
							</button>
							<button type="button" className="video-save-modal__btn video-save-modal__btn--save" onClick={handleSaveWord} disabled={saveLoading}>
								{saveLoading ? 'Đang lưu...' : 'Lưu'}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}
