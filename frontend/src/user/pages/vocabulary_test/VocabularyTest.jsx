import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import { usePremiumStatus } from '../../../hooks/usePremiumStatus'
import './vocabularyTest.css'

// --- Data ---
const TYPE_ARRAY = ['multiple-choice', 'true-false', 'fill-blank']

function shuffle(arr) {
	return [...arr].sort(() => Math.random() - 0.5)
}

const TYPE_LABELS = {
	'multiple-choice': 'Multiple Choice',
	'true-false': 'True / False',
	'fill-blank': 'Fill in the Blank',
	'matching': 'Match the Pairs',
}

const WORD_DETAILS = {}

function playWordAudio(word) {
	if (!word || !('speechSynthesis' in window)) {
		return
	}

	window.speechSynthesis.cancel()
	const utterance = new window.SpeechSynthesisUtterance(word)
	utterance.lang = 'en-US'
	utterance.rate = 0.9
	window.speechSynthesis.speak(utterance)
}

function getWordDetails(word) {
	if (!word) {
		return null
	}

	const normalizedWord = String(word).trim().toLowerCase()
	const knownDetails = WORD_DETAILS[normalizedWord]

	if (knownDetails) {
		return {
			word: normalizedWord,
			...knownDetails,
		}
	}

	return {
		word: normalizedWord,
		phonetic: '/.../',
		meaningEn: 'No definition available yet.',
		meaningVi: 'Chua co nghia cho tu nay.',
		example: `Example: ${normalizedWord}`,
	}
}

function AnswerWordPopup({ data, onNext }) {
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

// --- Progress Bar ---
function ProgressBar({ questions, currentIndex, answers }) {
	const pct = Math.round(((currentIndex) / questions.length) * 100)

	return (
		<div className="vtest-progress">
			<div className="vtest-progress__top">
				<span className="vtest-progress__label">Question {currentIndex + 1} / {questions.length}</span>
				<span className="vtest-progress__type">{TYPE_LABELS[questions[currentIndex]?.type]}</span>
			</div>
			<div className="vtest-progress__track">
				<div className="vtest-progress__fill" style={{ width: `${pct}%` }} />
			</div>
			<div className="vtest-progress__dots">
				{questions.map((q, i) => {
					const ans = answers[i]
					let status = 'upcoming'
					if (ans === true) status = 'correct'
					else if (ans === false) status = 'wrong'
					else if (i === currentIndex) status = 'current'
					return <div key={q.id} className={`vtest-dot vtest-dot--${status}`} title={`Q${i + 1}`} />
				})}
			</div>
		</div>
	)
}

// --- Multiple Choice ---
function MultipleChoiceQuestion({ question, onAnswer }) {
	const [selected, setSelected] = useState(null)
	const [confirmed, setConfirmed] = useState(false)

	const getChoiceClass = (choice) => {
		let cls = 'vtest-choice'
		if (confirmed) {
			if (choice === question.correct) cls += ' vtest-choice--correct'
			else if (choice === selected && choice !== question.correct) cls += ' vtest-choice--wrong'
		} else if (choice === selected) {
			cls += ' vtest-choice--selected'
		}
		return cls
	}

	const handleChoiceSelect = (choice) => {
		if (confirmed) return
		setSelected(choice)
		setConfirmed(true)
		onAnswer({
			isCorrect: choice === question.correct,
			word: question.correct,
			selectedAnswer: choice,
			correctAnswer: question.correct,
		})
	}

	return (
		<div className="vtest-question">
			<div className="vtest-question__lang-badge">
				{question.lang === 'vi' ? '🇻🇳 Vietnamese → English' : '🇬🇧 English → English'}
			</div>
			<p className="vtest-question__prompt">Which word matches this meaning?</p>
			<div className="vtest-definition-box">
				<p>{question.definition}</p>
			</div>

			<div className="vtest-choices">
				{question.choices.map((choice) => (
					<button
						key={choice}
						type="button"
						className={getChoiceClass(choice)}
						disabled={confirmed}
						onClick={() => handleChoiceSelect(choice)}
					>
						{choice}
					</button>
				))}
			</div>
		</div>
	)
}

// --- True / False ---
function TrueFalseQuestion({ question, onAnswer }) {
	const [selected, setSelected] = useState(null)
	const [confirmed, setConfirmed] = useState(false)

	const handleSelect = (value) => {
		if (confirmed) return
		setSelected(value)
		setConfirmed(true)
		onAnswer({
			isCorrect: value === question.isCorrect,
			word: question.word,
			selectedAnswer: value ? 'True' : 'False',
			correctAnswer: question.isCorrect ? 'True' : 'False',
		})
	}

	const getTrueBtnClass = () => {
		let cls = 'vtest-tf-btn vtest-tf-btn--true'
		if (confirmed) {
			if (question.isCorrect === true) cls += ' is-correct'
			else if (selected === true) cls += ' is-wrong'
		}
		return cls
	}

	const getFalseBtnClass = () => {
		let cls = 'vtest-tf-btn vtest-tf-btn--false'
		if (confirmed) {
			if (question.isCorrect === false) cls += ' is-correct'
			else if (selected === false) cls += ' is-wrong'
		}
		return cls
	}

	return (
		<div className="vtest-question">
			<p className="vtest-question__prompt">Is this definition correct for the word?</p>
			<div className="vtest-tf-card">
				<span className="vtest-tf-card__word">{question.word}</span>
				<span className="vtest-tf-card__arrow">→</span>
				<span className="vtest-tf-card__def">"{question.definition}"</span>
			</div>

			<div className="vtest-tf-choices">
				<button type="button" className={getTrueBtnClass()} disabled={confirmed} onClick={() => handleSelect(true)}>
					<span className="vtest-tf-icon">✓</span>
					True
				</button>
				<button type="button" className={getFalseBtnClass()} disabled={confirmed} onClick={() => handleSelect(false)}>
					<span className="vtest-tf-icon">✗</span>
					False
				</button>
			</div>

		</div>
	)
}

// --- Fill in the Blank ---
function FillBlankQuestion({ question, onAnswer }) {
	const [selected, setSelected] = useState(null)
	const [confirmed, setConfirmed] = useState(false)

	const isCorrect = selected === question.correct
	const parts = question.sentence.split('___')

	const getChoiceClass = (choice) => {
		let cls = 'vtest-choice'
		if (confirmed) {
			if (choice === question.correct) cls += ' vtest-choice--correct'
			else if (choice === selected && choice !== question.correct) cls += ' vtest-choice--wrong'
		} else if (choice === selected) {
			cls += ' vtest-choice--selected'
		}
		return cls
	}

	const handleChoiceSelect = (choice) => {
		if (confirmed) return
		setSelected(choice)
		setConfirmed(true)
		onAnswer({
			isCorrect: choice === question.correct,
			word: question.correct,
			selectedAnswer: choice,
			correctAnswer: question.correct,
		})
	}

	return (
		<div className="vtest-question">
			<p className="vtest-question__prompt">Choose the correct word to fill in the blank.</p>
			<div className="vtest-blank__sentence">
				<span>{parts[0]}</span>
				<span className={`vtest-blank__slot${confirmed ? (isCorrect ? ' is-correct' : ' is-wrong') : selected ? ' is-filled' : ''}`}>
					{selected || '_____'}
				</span>
				<span>{parts[1]}</span>
			</div>

			<div className="vtest-choices">
				{question.choices.map((choice) => (
					<button
						key={choice}
						type="button"
						className={getChoiceClass(choice)}
						disabled={confirmed}
						onClick={() => handleChoiceSelect(choice)}
					>
						{choice}
					</button>
				))}
			</div>
		</div>
	)
}

// --- Matching ---
function MatchingQuestion({ question, onAnswer }) {
	const [shuffledDefs] = useState(() => shuffle(question.pairs.map((p) => p.definition)))
	const [selectedWord, setSelectedWord] = useState(null)
	const [matched, setMatched] = useState({})
	const [wrongPair, setWrongPair] = useState(null)

	const allMatched = Object.keys(matched).length === question.pairs.length

	const handleWordClick = (word) => {
		if (matched[word]) return
		setSelectedWord((prev) => (prev === word ? null : word))
	}

	const handleDefClick = (def) => {
		if (!selectedWord) return
		if (Object.values(matched).includes(def)) return

		const correctDef = question.pairs.find((p) => p.word === selectedWord)?.definition
		if (def === correctDef) {
			setMatched((prev) => ({ ...prev, [selectedWord]: def }))
			setSelectedWord(null)
		} else {
			setWrongPair({ word: selectedWord, def })
			setTimeout(() => {
				setWrongPair(null)
				setSelectedWord(null)
			}, 700)
		}
	}

	return (
		<div className="vtest-question">
			<p className="vtest-question__prompt">Click a word on the left, then click its matching definition on the right.</p>

			<div className="vtest-matching">
				<div className="vtest-matching__col">
					{question.pairs.map(({ word }) => {
						const isMatched = !!matched[word]
						return (
							<button
								key={word}
								type="button"
								className={`vtest-match-card vtest-match-card--word${isMatched ? ' is-matched' : ''}${selectedWord === word ? ' is-selected' : ''}${wrongPair?.word === word ? ' is-wrong' : ''}`}
								onClick={() => handleWordClick(word)}
								disabled={isMatched}
							>
								{word}
								{isMatched && <span className="vtest-match-check">✓</span>}
							</button>
						)
					})}
				</div>

				<div className="vtest-matching__divider">
					{question.pairs.map((_, i) => (
						<div key={i} className="vtest-matching__line" />
					))}
				</div>

				<div className="vtest-matching__col">
					{shuffledDefs.map((def) => {
						const isMatched = Object.values(matched).includes(def)
						return (
							<button
								key={def}
								type="button"
								className={`vtest-match-card vtest-match-card--def${isMatched ? ' is-matched' : ''}${wrongPair?.def === def ? ' is-wrong' : ''}`}
								onClick={() => handleDefClick(def)}
								disabled={isMatched}
							>
								{def}
								{isMatched && <span className="vtest-match-check">✓</span>}
							</button>
						)
					})}
				</div>
			</div>

			{allMatched && (
				<div className="vtest-actions">
					<div className="vtest-feedback">
						<div className="vtest-feedback__banner is-correct">
							✓  All pairs matched correctly!
						</div>
						<button
							type="button"
							className="vtest-btn vtest-btn--next"
							onClick={() => onAnswer({
								isCorrect: true,
								word: null,
								selectedAnswer: 'All pairs matched',
								correctAnswer: 'All pairs matched',
							})}
						>
							Next →
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

// --- Results ---
function ResultsScreen({ questions, answers, answerDetails, onSync, isSyncing }) {
	const score = answers.filter(Boolean).length
	const total = questions.length
	const pct = (total === 0) ? 0 : Math.round((score / total) * 100)

	let gradeText = 'Keep practicing!'
	let gradeClass = 'is-low'
	if (pct >= 90) { gradeText = 'Hẹn gặp lại vào "Thời điểm vàng" tiếp theo! 🎉'; gradeClass = 'is-high' }
	else if (pct >= 70) { gradeText = 'Làm tốt lắm! 👍'; gradeClass = 'is-mid-high' }
	else if (pct >= 50) { gradeText = 'Khá ổn! 💪'; gradeClass = 'is-mid' }

	return (
		<div className="vtest-results">
			<div className={`vtest-results__circle ${gradeClass}`}>
				<div className="vtest-results__pct">{pct}%</div>
				<div className="vtest-results__grade">{gradeText}</div>
			</div>

			<div className="vtest-results__stats">
				<div className="vtest-results__stat vtest-results__stat--correct">
					<span className="vtest-results__stat-num">{score}</span>
					<span className="vtest-results__stat-label">Correct</span>
				</div>
				<div className="vtest-results__stat-divider" />
				<div className="vtest-results__stat vtest-results__stat--wrong">
					<span className="vtest-results__stat-num">{total - score}</span>
					<span className="vtest-results__stat-label">Incorrect</span>
				</div>
			</div>

			<div className="vtest-results__table-wrapper">
				<table className="vtest-results__table">
					<thead>
						<tr>
							<th style={{ width: '40px' }}>#</th>
							<th>Từ vựng</th>
							<th style={{ width: '80px' }}>Kết quả</th>
							<th style={{ width: '80px' }}>Tốc độ</th>
							<th>Bạn chọn</th>
							<th>Đáp án đúng</th>
						</tr>
					</thead>
					<tbody>
						{questions.map((q, i) => {
							const isCorrect = answers[i] === true
							const detail = answerDetails[i]
							const timeSec = detail?.responseTimeMs ? (detail.responseTimeMs / 1000).toFixed(1) + 's' : '---'
							
							return (
								<tr key={q.id} className={isCorrect ? 'row-correct' : 'row-wrong'}>
									<td>{i + 1}</td>
									<td><strong>{detail?.wordDetails?.word || '---'}</strong></td>
									<td>
										<span className={`result-badge ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
											{isCorrect ? '✓' : '✗'}
										</span>
									</td>
									<td><small>{timeSec}</small></td>
									<td><span className="user-choice">{detail?.selectedAnswer || '---'}</span></td>
									<td><span className="correct-ans">{detail?.correctAnswer || '---'}</span></td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>

			<div className="vtest-results__actions">
				<button 
					type="button" 
					className="vtest-btn vtest-btn--sync" 
					onClick={onSync} 
					disabled={isSyncing}
				>
					{isSyncing ? (
						<><span className="spinner"></span> Đang đồng bộ...</>
					) : (
						'Xác nhận & Cập nhật Thời điểm vàng 🚀'
					)}
				</button>
				<p className="vtest-results__hint">
					* Kết quả ôn tập sẽ được lưu vào tiến trình học tập của bạn sau khi nhấn xác nhận.
				</p>
			</div>
		</div>
	)
}

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
	const startTimeRef = useRef(null)

	const session = getUserSession()
	const userId = session?.userId ? Number(session.userId) : null
	const premiumStatus = usePremiumStatus(userId)

	useEffect(() => {
		if (!premiumStatus.loading && !premiumStatus.isPremium) {
			alert('✨ Tính năng ôn tập từ vựng (SRS) chỉ dành cho thành viên Premium. Hãy nâng cấp ngay để sử dụng!')
			navigate('/vocabulary')
		}
	}, [premiumStatus.loading, premiumStatus.isPremium, navigate])

	useEffect(() => {
		if (premiumStatus.isPremium) {
			fetchReviewQueue()
		}
	}, [premiumStatus.isPremium])

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
			const response = await fetch('/api/user/learning/review-queue', {
				headers: token ? { 'Authorization': `Bearer ${token}` } : {},
				credentials: 'include'
			})
			if (response.ok) {
				const data = await response.json()
				if (data.length > 0) {
					const generated = generateQuestions(data)
					setQuestions(generated)
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

	const generateQuestions = (vocabItems) => {
		return vocabItems.map((item, idx) => {
			const type = TYPE_ARRAY[idx % TYPE_ARRAY.length]
			
			if (type === 'multiple-choice') {
				const distractors = vocabItems
					.filter(v => v.word !== item.word)
					.map(v => v.word)
					.sort(() => 0.5 - Math.random())
					.slice(0, 3)
				
				while (distractors.length < 3) {
					distractors.push("Unknown " + distractors.length)
				}
				
				return {
					id: `q-${idx}`,
					type: 'multiple-choice',
					definition: item.meaningVi || item.meaningEn,
					correct: item.word,
					choices: shuffle([item.word, ...distractors]),
					lang: 'vi',
					itemMetadata: item
				}
			} else if (type === 'true-false') {
				const isCorrectChoice = Math.random() > 0.5
				let displayDef = item.meaningVi
				if (!isCorrectChoice) {
					const other = vocabItems.find(v => v.word !== item.word)
					displayDef = other ? (other.meaningVi || other.meaningEn) : "A different meaning"
				}
				return {
					id: `q-${idx}`,
					type: 'true-false',
					word: item.word,
					definition: displayDef,
					isCorrect: isCorrectChoice,
					itemMetadata: item
				}
			} else {
				const sentence = item.example || "I like to study ___ every day."
				const parts = sentence.toLowerCase().includes(item.word.toLowerCase()) 
					? sentence.replace(new RegExp(item.word, 'gi'), '___')
					: sentence + " (___)"
				
				const distractors = vocabItems
					.filter(v => v.word !== item.word)
					.map(v => v.word)
					.sort(() => 0.5 - Math.random())
					.slice(0, 3)

				return {
					id: `q-${idx}`,
					type: 'fill-blank',
					sentence: parts,
					correct: item.word,
					choices: shuffle([item.word, ...distractors]),
					itemMetadata: item
				}
			}
		})
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
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ results }),
				credentials: 'include'
			})
			if (response.ok) {
				alert('Chúc mừng! "Thời điểm vàng" đã được cập nhật dựa trên độ lưu loát của bạn. 🎉')
				navigate('/vocabulary')
			} else {
				throw new Error('Sync failed')
			}
		} catch (error) {
			console.error('Error submitting bulk results:', error)
			alert('Không thể đồng bộ kết quả. Vui lòng thử lại sau.')
		} finally {
			setIsSyncing(false)
		}
	}

	const goToNextQuestion = () => {
		if (currentIndex + 1 >= questions.length) {
			setPopupData(null)
			setIsFinished(true)
		} else {
			setPopupData(null)
			setCurrentIndex((prev) => prev + 1)
			setQuestionKey((prev) => prev + 1)
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
			phonetic: meta.phonetic,
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

		// Buffer everything in answerDetails
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
				{!isFinished ? (
					questions.length > 0 ? (
						<>
							<ProgressBar
								questions={questions}
								currentIndex={currentIndex}
								answers={answers}
							/>
							<div className="vtest-card">
								{renderQuestion()}
							</div>
						</>
					) : (
						<div className="vtest-card" style={{ textAlign: 'center', padding: '40px' }}>
							<h2>Tuyệt vời! 🎉</h2>
							<p>Bạn đã hoàn thành đủ số câu hỏi cho thời điểm này. Hãy quay lại sau khi hệ thống tính toán thời điểm vàng tiếp theo.</p>
							<button type="button" className="vtest-btn vtest-btn--retry" onClick={() => navigate('/vocabulary')}>
								Quay lại Vocabulary
							</button>
						</div>
					)
				) : (
					<ResultsScreen
						questions={questions}
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
