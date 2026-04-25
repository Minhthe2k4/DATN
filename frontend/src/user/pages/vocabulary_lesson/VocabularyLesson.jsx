import { useEffect, useMemo, useRef, useState } from 'react'
import { usePremiumStatus, isPremiumValid } from '../../../hooks/usePremiumStatus'
import { getUserSession } from '../../utils/authSession'
import './vocabularyLesson.css'



function getHintPositions(word) {
	if (word.length <= 4) {
		return [0]
	}

	return [0, word.length - 1]
}

function playWordAudio(word) {
	if (!('speechSynthesis' in window)) {
		return
	}

	window.speechSynthesis.cancel()
	const utterance = new window.SpeechSynthesisUtterance(word)
	utterance.lang = 'en-US'
	utterance.rate = 0.92
	window.speechSynthesis.speak(utterance)
}

function LessonResultPopup({ data, onNext }) {
	useEffect(() => {
		if (!data?.details?.word) {
			return
		}

		playWordAudio(data.details.word)
	}, [data])

	if (!data?.details) {
		return null
	}

	const { isCorrect, details } = data

	return (
		<div className="vtest-word-popup-wrap" aria-live="polite">
			<div className={`vtest-word-popup ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
				<div className="vtest-word-popup__head">
					<div className={`vtest-word-popup__badge ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
						{isCorrect ? 'Correct' : 'Incorrect'}
					</div>
				</div>

				<div className="vtest-word-popup__word-row">
					<div>
						<h3 className="vtest-word-popup__word">{details.word}</h3>
						<p className="vtest-word-popup__phonetic">{details.phonetic}</p>
					</div>
					<button
						type="button"
						className="vtest-word-popup__audio"
						onClick={() => playWordAudio(details.word)}
					>
						Play Audio
					</button>
				</div>

				<div className="vtest-word-popup__content">
					<p><strong>EN:</strong> {details.meaningEn}</p>
					<p><strong>VI:</strong> {details.meaningVi}</p>
					<p><strong>Example:</strong> {details.example}</p>
				</div>

				<div className="vtest-word-popup__footer">
					<button type="button" className="vtest-btn vtest-btn--next" onClick={onNext}>
						Next →
					</button>
				</div>
			</div>
		</div>
	)
}

function LessonCompletedModal({ data, onReplay, onClose }) {
	if (!data) {
		return null
	}

	return (
		<div className="vlesson-done-overlay" role="dialog" aria-modal="true" aria-live="polite">
			<div className="vlesson-done-card">
				<div className="vlesson-done-spark vlesson-done-spark--one" aria-hidden="true">✦</div>
				<div className="vlesson-done-spark vlesson-done-spark--two" aria-hidden="true">✦</div>
				<div className="vlesson-done-spark vlesson-done-spark--three" aria-hidden="true">✦</div>

				<p className="vlesson-done-badge">Lesson Completed</p>
				<h3>Bạn đã hoàn thành bài học</h3>
				<p className="vlesson-done-topic">{data.topicTitle}</p>
				<p className="vlesson-done-lesson">{data.lessonTitle}</p>
				<p className="vlesson-done-summary">Bạn đã hoàn thành {data.totalWords} từ vựng.</p>

				<div className="vlesson-done-actions">
					<button type="button" className="vlesson-primary" onClick={onReplay}>Học lại từ vựng</button>
					<button type="button" className="vlesson-ghost" onClick={onClose}>Chọn bài tiếp theo</button>
				</div>
			</div>
		</div>
	)
}

export function VocabularyLesson() {
	const [mode, setMode] = useState('topics')
	const [topicData, setTopicData] = useState([])
	const [selectedTopicId, setSelectedTopicId] = useState(null)
	const [selectedLessonId, setSelectedLessonId] = useState(null)
	const [wordIndex, setWordIndex] = useState(0)
	const [studyStep, setStudyStep] = useState('card')
	const [isFlipped, setIsFlipped] = useState(false)
	const [typedLetters, setTypedLetters] = useState([])
	const [checkState, setCheckState] = useState('idle')
	const [popupData, setPopupData] = useState(null)
	const [completedLessonData, setCompletedLessonData] = useState(null)
	const [failedLessonWords, setFailedLessonWords] = useState([])
	const [reviewWords, setReviewWords] = useState([])
	const [isReviewPhase, setIsReviewPhase] = useState(false)
	const session = getUserSession()
	const isLoggedIn = !!session
	const premiumStatus = usePremiumStatus(session?.userId)
	const isUserPremium = isPremiumValid(premiumStatus)
	const [isLessonEntryLoading, setIsLessonEntryLoading] = useState(false)
	const [lessonEntryProgress, setLessonEntryProgress] = useState(0)
	const [isLoadingTopics, setIsLoadingTopics] = useState(false)
	const [isLoadingLessons, setIsLoadingLessons] = useState(false)
	const inputRefs = useRef([])
	const lessonEntryIntervalRef = useRef(null)
	const lessonEntryTimeoutRef = useRef(null)

	// Fetch topics from backend
	useEffect(() => {
		const fetchTopics = async () => {
			setIsLoadingTopics(true)
			try {
				const response = await fetch('/api/user/lessons/topics')
				if (!response.ok) {
					throw new Error('Failed to fetch topics')
				}
				const topics = await response.json()
				setTopicData(topics)
			} catch (error) {
				console.error('Error fetching topics:', error)
			} finally {
				setIsLoadingTopics(false)
			}
		}

		fetchTopics()
	}, [])

	// Fetch lessons when topic is selected
	useEffect(() => {
		if (!selectedTopicId || isLoadingTopics) {
			return
		}

		const fetchLessons = async () => {
			setIsLoadingLessons(true)
			try {
				const response = await fetch(`/api/user/lessons/topics/${selectedTopicId}/lessons`)
				if (!response.ok) {
					throw new Error('Failed to fetch lessons')
				}
				const lessons = await response.json()
				
				// Update topicData with fetched lessons
				setTopicData((prev) =>
					prev.map((topic) =>
						topic.id === selectedTopicId
							? { ...topic, lessons }
							: topic
					)
				)
			} catch (error) {
				console.error('Error fetching lessons:', error)
			} finally {
				setIsLoadingLessons(false)
			}
		}

		fetchLessons()
	}, [selectedTopicId, isLoadingTopics])

	// Fetch lesson details when lesson is selected
	useEffect(() => {
		if (!selectedLessonId || !selectedTopicId) {
			return
		}

		const fetchLessonDetails = async () => {
			try {
				const response = await fetch(`/api/user/lessons/${selectedLessonId}`)
				if (!response.ok) {
					throw new Error('Failed to fetch lesson details')
				}
				const lessonDetails = await response.json()
				
				// Update topicData with fetched lesson details
				setTopicData((prev) =>
					prev.map((topic) =>
						topic.id === selectedTopicId
							? {
								...topic,
								lessons: topic.lessons.map((lesson) =>
									lesson.id === selectedLessonId
										? { ...lesson, words: lessonDetails.words }
										: lesson
								),
							}
							: topic
					)
				)
			} catch (error) {
				console.error('Error fetching lesson details:', error)
			}
		}

		fetchLessonDetails()
	}, [selectedLessonId, selectedTopicId])

	const selectedTopic = useMemo(
		() => topicData.find((topic) => topic.id === selectedTopicId) ?? null,
		[selectedTopicId, topicData]
	)

	const selectedLesson = useMemo(
		() => selectedTopic?.lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
		[selectedTopic, selectedLessonId]
	)

	const currentWordsSource = useMemo(() => {
		if (isReviewPhase) return reviewWords
		return selectedLesson?.words ?? []
	}, [isReviewPhase, reviewWords, selectedLesson])

	const currentWord = currentWordsSource[wordIndex] ?? null
	const hintPositions = useMemo(() => (currentWord ? getHintPositions(currentWord.word) : []), [currentWord])

	const createBaseLetters = (word, positions) => {
		return word.split('').map((_, index) => (positions.includes(index) ? word[index] : ''))
	}

	const startTypingStep = () => {
		if (!currentWord) {
			return
		}

		const baseLetters = createBaseLetters(currentWord.word, hintPositions)
		setTypedLetters(baseLetters)
		setCheckState('idle')
		setPopupData(null)
		setStudyStep('type')
		setIsFlipped(false)
	}

	useEffect(() => {
		if (!currentWord || studyStep !== 'type') {
			return
		}

		const focusIndex = typedLetters.findIndex((letter, index) => !hintPositions.includes(index) && !letter)
		if (focusIndex >= 0) {
			const timerId = window.setTimeout(() => {
				inputRefs.current[focusIndex]?.focus()
			}, 40)
			return () => window.clearTimeout(timerId)
		}
	}, [hintPositions, studyStep, typedLetters, currentWord])

	useEffect(() => {
		if (!currentWord || studyStep !== 'type') {
			return
		}

		playWordAudio(currentWord.word)
	}, [currentWord, studyStep])

	const handlePickTopic = (topicId) => {
		setSelectedTopicId(topicId)
		setSelectedLessonId(null)
		setMode('lessons')
	}

	const handlePickLesson = (lessonId) => {
		if (!isLoggedIn) {
			alert('Vui lòng đăng nhập để bắt đầu học từ vựng trong bài.')
			return
		}

		const lesson = selectedTopic?.lessons.find(l => l.id === lessonId)
		if (lesson?.isPremium && !isUserPremium) {
			alert('Bài học này chỉ dành cho tài khoản Premium. Vui lòng nâng cấp để tiếp tục!')
			return
		}

		if (isLessonEntryLoading) {
			return
		}

		setIsLessonEntryLoading(true)
		setLessonEntryProgress(0)

		if (lessonEntryIntervalRef.current) {
			window.clearInterval(lessonEntryIntervalRef.current)
		}

		if (lessonEntryTimeoutRef.current) {
			window.clearTimeout(lessonEntryTimeoutRef.current)
		}

		lessonEntryIntervalRef.current = window.setInterval(() => {
			setLessonEntryProgress((prev) => (prev >= 96 ? prev : prev + 4))
		}, 28)

		lessonEntryTimeoutRef.current = window.setTimeout(() => {
			if (lessonEntryIntervalRef.current) {
				window.clearInterval(lessonEntryIntervalRef.current)
				lessonEntryIntervalRef.current = null
			}

			setLessonEntryProgress(100)

			window.setTimeout(() => {
				setSelectedLessonId(lessonId)
				setWordIndex(0)
				setStudyStep('card')
				setIsFlipped(false)
				setCheckState('idle')
				setPopupData(null)
				setCompletedLessonData(null)
				setMode('study')
				setIsLessonEntryLoading(false)
			}, 120)

			lessonEntryTimeoutRef.current = null
		}, 780)
	}

	const handleTypeChange = (index, value) => {
		if (!currentWord || hintPositions.includes(index)) {
			return
		}

		const nextChar = value.slice(-1).toLowerCase().replace(/[^a-z]/g, '')
		setTypedLetters((prev) => {
			const next = [...prev]
			next[index] = nextChar
			return next
		})
		setCheckState('idle')
		setPopupData(null)

		if (nextChar) {
			const nextEditableIndex = typedLetters.findIndex((_, idx) => idx > index && !hintPositions.includes(idx))
			if (nextEditableIndex >= 0) {
				inputRefs.current[nextEditableIndex]?.focus()
			}
		}
	}

	const handleKeyDown = (index, event) => {
		if (event.key === 'Backspace' && !typedLetters[index]) {
			const previousEditableIndex = [...typedLetters]
				.map((_, idx) => idx)
				.filter((idx) => idx < index && !hintPositions.includes(idx))
				.pop()

			if (previousEditableIndex !== undefined) {
				inputRefs.current[previousEditableIndex]?.focus()
			}
		}
	}

	const handleCheckWord = () => {
		if (!currentWord) {
			return
		}

		const answer = typedLetters.join('').toLowerCase()
		const expected = currentWord.word.toLowerCase()
		const isCorrect = answer === expected
		const nextState = isCorrect ? 'correct' : 'wrong'

		setCheckState(nextState)
		setPopupData({
			isCorrect,
			details: {
				word: currentWord.word,
				phonetic: currentWord.phonetic,
				meaningEn: currentWord.meaningEn,
				meaningVi: currentWord.meaningVi,
				example: currentWord.example,
			},
		})
	}

	const handleNextWord = () => {
		if (!selectedLesson) {
			return
		}

		// Collect failed words for review at the end
		const isCorrect = popupData?.isCorrect
		if (popupData !== null && !isCorrect) {
			const failedWord = currentWord
			if (failedWord && !failedLessonWords.find(w => w.id === failedWord.id)) {
				setFailedLessonWords(prev => [...prev, failedWord])
			}
		}

		const isLastWord = wordIndex >= selectedLesson.words.length - 1
		if (isLastWord) {
			// If we have failed words, start a new review phase cycle
			if (failedLessonWords.length > 0) {
				setPopupData(null)
				setIsReviewPhase(true)
				// We keep the failed words but we need to reset the index and clear the list for the NEXT round of failures
				// Actually, it's better to move them to a 'currentReview' state.
				// For simplicity, we'll just use a trick:
				const wordsToReview = [...failedLessonWords]
				setFailedLessonWords([]) // Clear for the next failures during this review
				setWordIndex(0)
				setStudyStep('card')
				setIsFlipped(false)
				setCheckState('idle')
				// We need a way to pass wordsToReview to currentWordsSource. 
				// Let's use a separate state 'reviewWords'
				setReviewWords(wordsToReview)
				return
			}

			setPopupData(null)
			setPopupData(null)
			setCompletedLessonData({
				topicTitle: selectedTopic?.title ?? '',
				lessonTitle: selectedLesson.title,
				lessonId: selectedLesson.id,
				totalWords: selectedLesson.words.length,
			})
			setMode('lessons')
			setSelectedLessonId(null)
			setStudyStep('card')
			setWordIndex(0)
			setIsReviewPhase(false)
			setFailedLessonWords([])
			setReviewWords([])

			// Trigger backend track
			if (isLoggedIn) {
				const authToken = localStorage.getItem('token') || session?.userId;
				fetch(`/api/user/learning/complete-lesson/${selectedLesson.id}`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${authToken}`
					}
				}).catch(err => console.error('Failed to trigger lesson completion:', err))
			} else {
				console.log('Guest completed lesson - skipping backend sync')
			}

			return
		}

		setWordIndex((prev) => prev + 1)
		setStudyStep('card')
		setIsFlipped(false)
		setCheckState('idle')
		setPopupData(null)
	}

	const handleSkipKnownWord = () => {
		setPopupData(null)
		handleNextWord()
	}

	const handleReplayCompletedLesson = () => {
		if (!completedLessonData) {
			return
		}

		handlePickLesson(completedLessonData.lessonId)
	}

	useEffect(() => {
		if (!completedLessonData && !isLessonEntryLoading) {
			return undefined
		}

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		return () => {
			document.body.style.overflow = previousOverflow
		}
	}, [completedLessonData, isLessonEntryLoading])

	useEffect(() => {
		return () => {
			if (lessonEntryIntervalRef.current) {
				window.clearInterval(lessonEntryIntervalRef.current)
			}

			if (lessonEntryTimeoutRef.current) {
				window.clearTimeout(lessonEntryTimeoutRef.current)
			}
		}
	}, [])

	return (
		<div className="vlesson-page">
			{isLessonEntryLoading && (
				<div className="vlesson-entry-overlay" role="status" aria-live="polite">
					<div className="vlesson-entry-card">
						<p className="vlesson-entry-title">Chuẩn bị vào bài học...</p>
						<p className="vlesson-entry-subtitle">Flashcard và phần kiểm tra nghe - gõ đang sẵn sàng</p>
						<div className="vlesson-entry-track">
							<div className="vlesson-entry-fill" style={{ width: `${lessonEntryProgress}%` }} />
						</div>
						<p className="vlesson-entry-percent">{lessonEntryProgress}%</p>
					</div>
				</div>
			)}

			<div className={`vlesson-shell${mode === 'study' ? ' vlesson-shell--study' : ''}`}>
				<header className={`vlesson-header${mode === 'study' ? ' vlesson-header--compact' : ''}`}>
					<h1>Bài học từ vựng tiếng Anh</h1>
					<p>Chọn chủ đề, vào bài học chi tiết và học từng từ theo nguồn flashcard + nghe và gõ lại.</p>
				</header>

				{mode === 'topics' && (
					<section>
						<div className="vlesson-section-title">Danh sách chủ đề</div>
					{isLoadingTopics ? (
						<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
							<p>Đang tải danh sách chủ đề...</p>
						</div>
					) : topicData.length === 0 ? (
						<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
							<p>Chưa có chủ đề nào. Vui lòng tải lại trang.</p>
						</div>
					) : (
						<div className="vlesson-grid">
							{topicData.map((topic) => (
								<button key={topic.id} type="button" className="vlesson-tile" onClick={() => handlePickTopic(topic.id)}>
									<img src={topic.image} alt={topic.title} className="vlesson-tile__image" />
									<div className="vlesson-tile__overlay" />
									<div className="vlesson-tile__content">
										<h3>{topic.title}</h3>
										<p>{topic.description}</p>
									</div>
								</button>
							))}
						</div>
					)}
				</section>
			)}

			{mode === 'lessons' && selectedTopic && (
				<section>
					<div className="vlesson-toolbar">
						<button type="button" className="vlesson-ghost" onClick={() => setMode('topics')}>Quay trở lại chủ đề</button>
						<div className="vlesson-section-title">{selectedTopic.title}</div>
					</div>

					{isLoadingLessons ? (
						<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
							<p>Đang tải danh sách bài học...</p>
						</div>
					) : !selectedTopic.lessons || selectedTopic.lessons.length === 0 ? (
						<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
							<p>Chủ đề này chưa có bài học nào.</p>
						</div>
					) : (
						<div className="vlesson-grid vlesson-grid--lessons">
							{selectedTopic.lessons.map((lesson) => (
								<button key={lesson.id} type="button" className={`vlesson-lesson ${lesson.isPremium && !isUserPremium ? 'is-locked' : ''}`} onClick={() => handlePickLesson(lesson.id)}>
									<div className="vlesson-lesson__header">
										<h3>{lesson.title}</h3>
										{lesson.isPremium && (
											<span className="vlesson-premium-badge" title="Chỉ dành cho Premium">👑</span>
										)}
									</div>
									<p>{lesson.description}</p>
									<div className="vlesson-lesson__footer">
										<span>{lesson.words ? lesson.words.length : 0} từ vựng</span>
										{lesson.isPremium && !isUserPremium && (
											<span className="vlesson-lock-icon">🔒 Khóa</span>
										)}
									</div>
								</button>
							))}
						</div>
					)}
				</section>
			)}

			{mode === 'study' && selectedTopic && selectedLesson && currentWord && (
				<section className="vlesson-study">
						<div className="vlesson-toolbar">
							<button
								type="button"
								className="vlesson-ghost"
								onClick={() => {
									setMode('lessons')
									setSelectedLessonId(null)
								}}
							>
								Quay trở lại bài học
							</button>
							<div className="vlesson-progress">{selectedTopic.title} / {selectedLesson.title} / Word {wordIndex + 1}/{selectedLesson.words.length}</div>
						</div>

						{studyStep === 'card' && (
							<>
								<button
									type="button"
									className={`flashcard${isFlipped ? ' is-flipped' : ''}`}
									onClick={() => setIsFlipped((prev) => !prev)}
									aria-label="Lat flashcard"
								>
									<div className="flashcard__face flashcard__face--front">
										<div className="flashcard__top">
											<span className="flashcard__tag">Mặt trước</span>
											<button
												type="button"
												className="flashcard__audio-btn"
												onClick={(event) => {
													event.stopPropagation()
													playWordAudio(currentWord.word)
												}}
											>
												<svg viewBox="0 0 24 24" aria-hidden="true">
													<path d="M5 10v4h3l4 3V7L8 10H5z" fill="currentColor" />
													<path d="M15 9a4 4 0 010 6M17.5 7a7 7 0 010 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
												</svg>
												Audio
											</button>
										</div>
										<h2>{currentWord.word}</h2>
										<p className="flashcard__phonetic">{currentWord.phonetic}</p>
										<p className="flashcard__example">{currentWord.example}</p>
										<p className="flashcard__tap-note">Nhấn vào card để lật mặt.</p>
									</div>
									<div className="flashcard__face flashcard__face--back">
										<span className="flashcard__tag">Mặt sau</span>
										<h2>{currentWord.word}</h2>
										<p className="flashcard__phonetic">{currentWord.phonetic}</p>
										<p className="flashcard__example">{currentWord.example}</p>
										<p className="flashcard__meaning">Nghĩa tiếng Anh: {currentWord.meaningEn}</p>
										<p className="flashcard__meaning">Nghĩa tiếng Việt: {currentWord.meaningVi}</p>
									</div>
								</button>

								<div className="study-actions">
									<button type="button" className="vlesson-skip" onClick={handleSkipKnownWord}>
										Đã biết từ
									</button>
									<button
										type="button"
										className="vlesson-primary"
										onClick={startTypingStep}
									>
										Bước 2: Nghe và gõ lại từ
									</button>
								</div>
							</>
						)}

						{studyStep === 'type' && (
							<div className="typing-stage">
								<div className="typing-stage__head">
									<h3>Nghe audio và nhập lại từ vựng</h3>
									<button type="button" className="vlesson-ghost" onClick={() => playWordAudio(currentWord.word)}>Phát lại audio</button>
								</div>

								<div className="letter-inputs">
									{currentWord.word.split('').map((_, index) => {
										const isHint = hintPositions.includes(index)

										return (
											<input
												key={`${currentWord.word}-${index}`}
												ref={(node) => {
													inputRefs.current[index] = node
												}}
												className={`letter-box${isHint ? ' is-hint' : ''}`}
												type="text"
												inputMode="text"
												maxLength={1}
												value={typedLetters[index] ?? ''}
												disabled={isHint}
												onChange={(event) => handleTypeChange(index, event.target.value)}
												onKeyDown={(event) => handleKeyDown(index, event)}
												aria-label={`Letter ${index + 1}`}
											/>
										)
									})}
								</div>

								<p className="typing-stage__hint">Hint: 1-2 ký tự gợi ý đã được bôi mờ giúp bạn gợi nhớ từ.</p>

								<div className="study-actions">
									<button type="button" className="vlesson-ghost" onClick={() => setStudyStep('card')}>Quay lại flashcard</button>
									{checkState !== 'correct' && (
										<button type="button" className="vlesson-primary" onClick={handleCheckWord}>Kiểm tra</button>
									)}
									{checkState === 'correct' && (
										<button type="button" className="vlesson-primary" onClick={handleNextWord}>Từ tiếp theo</button>
									)}
								</div>
							</div>
						)}
					</section>
				)}

				<LessonResultPopup
					data={popupData}
					onNext={handleNextWord}
				/>

				<LessonCompletedModal
					data={completedLessonData}
					onReplay={handleReplayCompletedLesson}
					onClose={() => setCompletedLessonData(null)}
				/>
			</div>
		</div>
	)
}
