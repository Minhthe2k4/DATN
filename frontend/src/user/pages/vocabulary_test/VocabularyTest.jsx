import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import { toast } from '@/utils/toastUtils'
import './vocabularyTest.css'

import { Library, PartyPopper } from 'lucide-react'
import { TYPE_ARRAY, shuffle, generateQuestions } from './testUtils'
import { AnswerWordPopup } from './components/AnswerWordPopup'
import { ProgressBar } from './components/ProgressBar'
import { MultipleChoiceQuestion } from './components/MultipleChoiceQuestion'
import { TrueFalseQuestion } from './components/TrueFalseQuestion'
import { FillBlankQuestion } from './components/FillBlankQuestion'
import { MatchingQuestion } from './components/MatchingQuestion'
import { ResultsScreen } from './components/ResultsScreen'

// --- Main Export ---
export function VocabularyTest() {
	const navigate = useNavigate()
	const [questions, setQuestions] = useState([])
	const [currentIndex, setCurrentIndex] = useState(0)
	const [answers, setAnswers] = useState([])
	const [answerDetails, setAnswerDetails] = useState([])
	const [isFinished, setIsFinished] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [questionKey, setQuestionKey] = useState(0)
	const [popupData, setPopupData] = useState(null)
	const [isSyncing, setIsSyncing] = useState(false)
	const [failedQueue, setFailedQueue] = useState([])
	const [isReviewPhase, setIsReviewPhase] = useState(false)
	const [originalQuestions, setOriginalQuestions] = useState([])
	const [allVocabPool, setAllVocabPool] = useState([])
	const [notEnoughTotalWords, setNotEnoughTotalWords] = useState(false)
	const startTimeRef = useRef(null)

	const session = getUserSession()
	const userId = session?.userId ? Number(session.userId) : null
	const premiumStatus = usePremiumStatus(userId)

	useEffect(() => {
		fetchReviewQueue()
	}, [])

	useEffect(() => {
		if (!isLoading && questions.length > 0 && !isFinished) {
			startTimeRef.current = performance.now()
		}
	}, [currentIndex, isLoading, isFinished, questions.length])

	const fetchReviewQueue = async () => {
		try {
			setIsLoading(true)
			const session = getUserSession();
			const token = localStorage.getItem('token') || session?.userId;
			
			// 1. Fetch all words for distractors pool
			const allResponse = await fetch('/api/user/learning/all-vocab', {
				headers: { ...getAuthHeader() },
				credentials: 'include'
			})
			let pool = []
			if (allResponse.ok) {
				pool = await allResponse.json()
				setAllVocabPool(pool)
			}

			// 2. Check minimum pool size (at least 4 words saved total)
			if (pool.length < 4) {
				setNotEnoughTotalWords(true)
				setIsLoading(false)
				return
			}

			// 3. Fetch due reviews
			const response = await fetch('/api/user/learning/review-queue', {
				headers: { ...getAuthHeader() },
				credentials: 'include'
			})
			if (response.ok) {
				const data = await response.json()
				if (data.length > 0) {
					const generated = generateQuestions(data, pool)
					setQuestions(generated)
					setOriginalQuestions(generated)
					setAnswers(Array(generated.length).fill(null))
					setAnswerDetails(Array(generated.length).fill(null))
				}
			}
		} catch (error) {
			console.error('Error fetching review queue:', error)
		} finally {
			setIsLoading(false)
		}
	}


	const handleSync = async () => {
		const results = answerDetails.map((detail) => ({
			vocabId: detail.vocabId,
			isCustom: detail.isCustom,
			isCorrect: detail.isCorrect,
			responseTimeMs: detail.responseTimeMs
		}))

		try {
			setIsSyncing(true)
			const session = getUserSession();
			const token = localStorage.getItem('token') || session?.userId;
			const response = await fetch('/api/user/learning/bulk-submit-results', {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json',
					...getAuthHeader()
				},
				body: JSON.stringify({ results }),
				credentials: 'include'
			})
			if (response.ok) {
				toast.success('Chúc mừng! "Thời điểm vàng" đã được cập nhật thành công.')
				navigate('/vocabulary')
			} else {
				throw new Error('Sync failed')
			}
		} catch (error) {
			console.error('Error submitting bulk results:', error)
			toast.error('Không thể đồng bộ kết quả. Vui lòng thử lại sau.')
		} finally {
			setIsSyncing(false)
		}
	}

	const goToNextQuestion = () => {
		if (currentIndex + 1 < questions.length) {
			setPopupData(null)
			setCurrentIndex((prev) => prev + 1)
			setQuestionKey((prev) => prev + 1)
		} else {
			// Finished current batch, check if there's a failed queue to review
			if (failedQueue.length > 0) {
				setPopupData(null)
				setQuestions([...failedQueue])
				setFailedQueue([])
				setCurrentIndex(0)
				setQuestionKey((prev) => prev + 1)
				setIsReviewPhase(true)
			} else {
				setPopupData(null)
				setIsFinished(true)
			}
		}
	}

	const handleAnswer = (payload) => {
		const isCorrect = payload?.isCorrect ?? false
		const question = questions[currentIndex]
		const meta = question.itemMetadata
		const now = performance.now()
		const responseTimeMs = Math.round(now - startTimeRef.current)
		
		const details = {
			word: meta.word,
			pronunciation: meta.pronunciation,
			meaningEn: meta.meaningEn,
			meaningVi: meta.meaningVi,
			example: meta.example
		}

		if (details) {
			setPopupData({
				isCorrect,
				details,
			})
		}

		// Buffer everything in answerDetails ONLY if it's the first attempt (not in review phase)
		if (!isReviewPhase) {
			setAnswerDetails((prev) => {
				const next = [...prev]
				next[currentIndex] = {
					vocabId: meta.vocabId,
					isCustom: meta.isCustom,
					isCorrect: isCorrect,
					responseTimeMs: responseTimeMs,
					selectedAnswer: payload?.selectedAnswer ?? '---',
					correctAnswer: payload?.correctAnswer ?? '---',
					wordDetails: details
				}
				return next
			})

			setAnswers((prev) => {
				const next = [...prev]
				next[currentIndex] = isCorrect
				return next
			})
		}

		// If incorrect, add to failedQueue for later review
		if (!isCorrect) {
			setFailedQueue(prev => [...prev, question])
		}

		if (!details) {
			goToNextQuestion()
		}
	}

	const currentQuestion = questions[currentIndex]

	const renderQuestion = () => {
		if (!currentQuestion) return null
		switch (currentQuestion.type) {
			case 'multiple-choice':
				return <MultipleChoiceQuestion key={questionKey} question={currentQuestion} onAnswer={handleAnswer} />
			case 'true-false':
				return <TrueFalseQuestion key={questionKey} question={currentQuestion} onAnswer={handleAnswer} />
			case 'fill-blank':
				return <FillBlankQuestion key={questionKey} question={currentQuestion} onAnswer={handleAnswer} />
			case 'matching':
				return <MatchingQuestion key={questionKey} question={currentQuestion} onAnswer={handleAnswer} />
			default:
				return null
		}
	}

	if (isLoading) {
		return <div className="vtest-page"><div className="vtest-container" style={{ textAlign: 'center', padding: '100px' }}><h2>Đang tải hàng đợi ôn tập...</h2></div></div>
	}

	return (
		<section className="vtest-page">
			<div className="vtest-container">
				{notEnoughTotalWords ? (
					<div className="vtest-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
						<div className="vtest-card__icon-large"><Library size={64} color="#3b82f6" /></div>
						<h2 style={{ color: '#2d3436', marginBottom: '15px' }}>Chưa đủ từ vựng để bắt đầu</h2>
						<p style={{ color: '#636e72', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 30px' }}>
							Hệ thống cần ít nhất <strong>4 từ vựng</strong> trong danh sách của bạn để tạo các câu hỏi trắc nghiệm chất lượng. 
							Hãy học thêm từ mới để bắt đầu ôn tập nhé!
						</p>
						<button type="button" className="vtest-btn vtest-btn--retry" onClick={() => navigate('/vocabulary')}>
							Đi tới Từ vựng của tôi
						</button>
					</div>
				) : !isFinished ? (
					questions.length > 0 ? (
						<>
							<ProgressBar
								questions={questions}
								currentIndex={currentIndex}
								answers={isReviewPhase ? Array(questions.length).fill(null) : answers}
							/>
							<div className="vtest-card">
								{renderQuestion()}
							</div>
						</>
					) : (
						<div className="vtest-card" style={{ textAlign: 'center', padding: '40px' }}>
							<div className="vtest-card__icon-large"><PartyPopper size={64} color="#22c55e" /></div>
							<h2>Tuyệt vời!</h2>
							<p>Bạn đã hoàn thành đủ số câu hỏi cho thời điểm này. Hãy quay lại sau khi hệ thống tính toán thời điểm vàng tiếp theo.</p>
							<button type="button" className="vtest-btn vtest-btn--retry" onClick={() => navigate('/vocabulary')}>
								Quay lại Từ vựng
							</button>
						</div>
					)
				) : (
					<ResultsScreen
						questions={originalQuestions}
						answers={answers}
						answerDetails={answerDetails}
						onSync={handleSync}
						isSyncing={isSyncing}
					/>
				)}
			</div>

			<AnswerWordPopup
				data={popupData}
				onNext={goToNextQuestion}
			/>
		</section>
	)
}
