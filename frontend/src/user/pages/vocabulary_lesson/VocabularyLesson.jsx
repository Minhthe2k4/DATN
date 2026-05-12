import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { usePremiumStatus, isPremiumValid } from '../../../hooks/usePremiumStatus'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import { toast } from '@/utils/toastUtils'
import './vocabularyLesson.css'

import { getHintPositions, playWordAudio } from './lessonUtils'

import { LessonResultPopup } from './components/LessonResultPopup'
import { LessonCompletedModal } from './components/LessonCompletedModal'
import { LessonEntryOverlay } from './components/LessonEntryOverlay'
import { TopicSelection } from './components/TopicSelection'
import { LessonSelection } from './components/LessonSelection'
import { FlashcardStudy } from './components/FlashcardStudy'
import { TypingStudy } from './components/TypingStudy'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

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
	const isSRSUnlocked = premiumStatus?.featureLimits?.SRS_GOLDEN_TIME?.IS_LOCKED === false
	const isReviewUnlocked = premiumStatus?.featureLimits?.VOCABULARY_REVIEW?.IS_LOCKED === false
	const isVocabFeatureUnlocked = isUserPremium || isSRSUnlocked || isReviewUnlocked

	const [isLessonEntryLoading, setIsLessonEntryLoading] = useState(false)
	const [lessonEntryProgress, setLessonEntryProgress] = useState(0)
	const [isLoadingTopics, setIsLoadingTopics] = useState(false)
	const [isLoadingLessons, setIsLoadingLessons] = useState(false)

	const inputRefs = useRef([])
	const lessonEntryIntervalRef = useRef(null)
	const lessonEntryTimeoutRef = useRef(null)

	useEffect(() => {
		const fetchTopics = async () => {
			setIsLoadingTopics(true)
			try {
				const response = await fetch('/api/user/lessons/topics')
				if (response.ok) {
					const topics = await response.json()
					setTopicData(topics)
				}
			} catch (error) {
				console.error('Error fetching topics:', error)
			} finally {
				setIsLoadingTopics(false)
			}
		}
		fetchTopics()
	}, [])

	useEffect(() => {
		if (!selectedTopicId || isLoadingTopics) return

		const fetchLessons = async () => {
			setIsLoadingLessons(true)
			try {
				const response = await fetch(`/api/user/lessons/topics/${selectedTopicId}/lessons`)
				if (response.ok) {
					const lessons = await response.json()
					setTopicData((prev) =>
						prev.map((topic) => topic.id === selectedTopicId ? { ...topic, lessons } : topic)
					)
				}
			} catch (error) {
				console.error('Error fetching lessons:', error)
			} finally {
				setIsLoadingLessons(false)
			}
		}
		fetchLessons()
	}, [selectedTopicId, isLoadingTopics])

	useEffect(() => {
		if (!selectedLessonId || !selectedTopicId) return

		const fetchLessonDetails = async () => {
			try {
				const response = await fetch(`/api/user/lessons/${selectedLessonId}`)
				if (response.ok) {
					const lessonDetails = await response.json()
					setTopicData((prev) =>
						prev.map((topic) =>
							topic.id === selectedTopicId
								? {
									...topic,
									lessons: topic.lessons.map((lesson) =>
										lesson.id === selectedLessonId ? { ...lesson, words: lessonDetails.words } : lesson
									),
								}
								: topic
						)
					)
				}
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

	const startTypingStep = () => {
		if (!currentWord) return
		const baseLetters = currentWord.word.split('').map((_, index) => (hintPositions.includes(index) ? currentWord.word[index] : ''))
		setTypedLetters(baseLetters)
		setCheckState('idle')
		setPopupData(null)
		setStudyStep('type')
		setIsFlipped(false)
	}

	useEffect(() => {
		if (!currentWord || studyStep !== 'type') return
		const focusIndex = typedLetters.findIndex((letter, index) => !hintPositions.includes(index) && !letter)
		if (focusIndex >= 0) {
			const timerId = window.setTimeout(() => inputRefs.current[focusIndex]?.focus(), 40)
			return () => window.clearTimeout(timerId)
		}
	}, [hintPositions, studyStep, typedLetters, currentWord])

	const handlePickTopic = (topicId) => {
		setSelectedTopicId(topicId)
		setSelectedLessonId(null)
		setMode('lessons')
	}

	// Bắt đầu một bài học cụ thể
	const handlePickLesson = (lessonId) => {
		if (!isLoggedIn) {
			toast.warning('Vui lòng đăng nhập để bắt đầu học.')
			return
		}
		
		// Kiểm tra quyền Premium nếu bài học yêu cầu
		const lesson = selectedTopic?.lessons.find(l => l.id === lessonId)
		if (lesson?.isPremium && !isVocabFeatureUnlocked) {
			toast.error('Bài học Premium. Vui lòng nâng cấp tài khoản!')
			return
		}

		// Kích hoạt hiệu ứng loading chuyển cảnh (Entry Overlay)
		setIsLessonEntryLoading(true)
		setLessonEntryProgress(0)
		lessonEntryIntervalRef.current = window.setInterval(() => {
			setLessonEntryProgress((prev) => (prev >= 96 ? prev : prev + 4))
		}, 28)

		lessonEntryTimeoutRef.current = window.setTimeout(() => {
			window.clearInterval(lessonEntryIntervalRef.current)
			setLessonEntryProgress(100)
			window.setTimeout(() => {
				// Reset các trạng thái và vào màn hình học tập (Study Mode)
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
		}, 780)
	}

	// Xử lý khi người dùng gõ ký tự vào ô input trong bước Typing Study
	const handleTypeChange = (index, value) => {
		if (!currentWord || hintPositions.includes(index)) return
		
		// Chỉ lấy ký tự cuối cùng và lọc bỏ các ký tự không phải chữ cái
		const nextChar = value.slice(-1).toLowerCase().replace(/[^a-z]/g, '')
		
		setTypedLetters((prev) => {
			const next = [...prev]
			next[index] = nextChar
			return next
		})
		setCheckState('idle')
		
		// Tự động chuyển sang ô input tiếp theo nếu vừa gõ một ký tự
		if (nextChar) {
			const nextEditableIndex = typedLetters.findIndex((_, idx) => idx > index && !hintPositions.includes(idx))
			if (nextEditableIndex >= 0) inputRefs.current[nextEditableIndex]?.focus()
		}
	}

	const handleKeyDown = (index, event) => {
		if (event.key === 'Enter') {
			if (popupData) {
				handleNextWord()
			} else {
				handleCheckWord()
			}
			return
		}

		if (event.key === 'Backspace' && !typedLetters[index]) {
			const previousEditableIndex = [...typedLetters].map((_, idx) => idx).filter((idx) => idx < index && !hintPositions.includes(idx)).pop()
			if (previousEditableIndex !== undefined) inputRefs.current[previousEditableIndex]?.focus()
		}
	}

	// Kiểm tra xem từ vừa gõ có đúng với từ khóa không
	const handleCheckWord = () => {
		if (!currentWord) return
		const isCorrect = typedLetters.join('').toLowerCase() === currentWord.word.toLowerCase()
		setCheckState(isCorrect ? 'correct' : 'wrong')
		
		// Hiển thị Popup kết quả (Đúng/Sai kèm chi tiết)
		setPopupData({ isCorrect, details: currentWord })
	}

	const handleNextWord = () => {
		if (!selectedLesson) return
		if (popupData !== null && !popupData.isCorrect) {
			if (!failedLessonWords.find(w => w.id === currentWord.id)) {
				setFailedLessonWords(prev => [...prev, currentWord])
			}
		}

		const isLastWord = wordIndex >= currentWordsSource.length - 1
		if (isLastWord) {
			if (failedLessonWords.length > 0) {
				setPopupData(null)
				setIsReviewPhase(true)
				setReviewWords([...failedLessonWords])
				setFailedLessonWords([])
				setWordIndex(0)
				setStudyStep('card')
				setIsFlipped(false)
				setCheckState('idle')
				return
			}

			setPopupData(null)
			setCompletedLessonData({
				topicTitle: selectedTopic?.title ?? '',
				lessonTitle: selectedLesson.title,
				lessonId: selectedLesson.id,
				totalWords: selectedLesson.words.length,
			})
			setMode('lessons')
			setSelectedLessonId(null)
			setWordIndex(0)
			setIsReviewPhase(false)

			if (isLoggedIn) {
				fetch(`/api/user/learning/complete-lesson/${selectedLesson.id}`, {
					method: 'POST',
					headers: { ...getAuthHeader() }
				}).catch(err => console.error('Failed to sync completion:', err))
			}
			return
		}

		setWordIndex((prev) => prev + 1)
		setStudyStep('card')
		setIsFlipped(false)
		setCheckState('idle')
		setPopupData(null)
	}

	useEffect(() => {
		return () => {
			window.clearInterval(lessonEntryIntervalRef.current)
			window.clearTimeout(lessonEntryTimeoutRef.current)
		}
	}, [])

	return (
		<div className="vlesson-page">
			<LessonEntryOverlay progress={lessonEntryProgress} isLoading={isLessonEntryLoading} />

			<div className={`vlesson-shell${mode === 'study' ? ' vlesson-shell--study' : ''}`}>
				<header className={`vlesson-header${mode === 'study' ? ' vlesson-header--compact' : ''}`}>
					<h1>Bài học từ vựng tiếng Anh</h1>
					<p>Khám phá bộ từ vựng theo chủ đề, ghi nhớ qua flashcard và kiểm tra phản xạ nghe - gõ.</p>
				</header>

				{mode === 'topics' && (
					<TopicSelection topics={topicData} onPickTopic={handlePickTopic} isLoading={isLoadingTopics} />
				)}

				{mode === 'lessons' && selectedTopic && (
					<LessonSelection
						topic={selectedTopic}
						onPickLesson={handlePickLesson}
						onBack={() => setMode('topics')}
						isLoading={isLoadingLessons}
						isVocabFeatureUnlocked={isVocabFeatureUnlocked}
					/>
				)}

				{mode === 'study' && currentWord && (
					<section className="vlesson-study">
						<div className="vlesson-toolbar">
							<button type="button" className="vlesson-ghost" onClick={() => { setMode('lessons'); setSelectedLessonId(null); }}>
								<ArrowLeft size={18} style={{ marginRight: '8px' }} />
								Quay lại danh sách
							</button>
							<div className="vlesson-progress">
								{isReviewPhase ? 'Ôn tập lỗi' : `${selectedTopic?.title} / ${selectedLesson?.title}`}
								{` • Từ ${wordIndex + 1}/${currentWordsSource.length}`}
							</div>
						</div>

						{studyStep === 'card' ? (
							<FlashcardStudy
								word={currentWord}
								isFlipped={isFlipped}
								onFlip={() => setIsFlipped(!isFlipped)}
								onSkip={() => { setPopupData(null); handleNextWord(); }}
								onNextStep={startTypingStep}
							/>
						) : (
							<TypingStudy
								word={currentWord}
								typedLetters={typedLetters}
								hintPositions={hintPositions}
								checkState={checkState}
								onTypeChange={handleTypeChange}
								onKeyDown={handleKeyDown}
								onCheck={handleCheckWord}
								onNext={handleNextWord}
								onBackToCard={() => setStudyStep('card')}
								inputRefs={inputRefs}
							/>
						)}
					</section>
				)}

				<LessonResultPopup data={popupData} onNext={handleNextWord} />
				<LessonCompletedModal
					data={completedLessonData}
					onReplay={() => handlePickLesson(completedLessonData.lessonId)}
					onClose={() => setCompletedLessonData(null)}
				/>
			</div>
		</div>
	)
}
