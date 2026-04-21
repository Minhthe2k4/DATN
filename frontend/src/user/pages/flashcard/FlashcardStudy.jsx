import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import './Flashcard.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export default function FlashcardStudy() {
  const { deckId } = useParams()
  const navigate = useNavigate()
  const session = getUserSession()
  const [cards, setCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [mode, setMode] = useState('FLIP') // 'FLIP', 'MCQ', 'MATCH'
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    fetchCards()
  }, [deckId])

  const fetchCards = async () => {
    try {
      const authToken = localStorage.getItem('token') || session?.userId
      const res = await fetch(`${API_BASE_URL}/api/user/flashcards/decks/${deckId}/cards`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCards(shuffleArray(data))
      }
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const shuffleArray = (array) => {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      setIsFinished(true)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const currentCard = cards[currentIndex]

  // MCQ Logic
  const mcqOptions = useMemo(() => {
    if (mode !== 'MCQ' || !currentCard || cards.length < 4) return []
    const correct = currentCard.backText || currentCard.meaningVi
    const distractors = cards
      .filter(c => c.id !== currentCard.id)
      .map(c => c.backText || c.meaningVi)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
    return shuffleArray([correct, ...distractors])
  }, [mode, currentIndex, cards])

  const handleAnswer = (answer) => {
    const correct = currentCard.backText || currentCard.meaningVi
    if (answer === correct) {
      setScore(score + 1)
    }
    handleNext()
  }

  if (isLoading) return <div className="flashcard-study">Đang tải thẻ...</div>
  if (cards.length === 0) return (
    <div className="flashcard-study">
      <div className="empty-state">
        <h2>Bộ thẻ này đang trống</h2>
        <p>Hãy thêm từ vựng vào bộ thẻ này để bắt đầu học.</p>
        <button className="btn-primary" onClick={() => navigate('/flashcards')}>Quay lại</button>
      </div>
    </div>
  )

  if (isFinished) return (
    <div className="flashcard-study result-screen">
      <h1>Hoàn thành!</h1>
      <p>Bạn đã hoàn thành việc ôn tập bộ thẻ này.</p>
      {mode === 'MCQ' && <div className="final-score">Điểm của bạn: {score}/{cards.length}</div>}
      <div className="result-actions">
        <button className="btn-secondary" onClick={() => { setIsFinished(false); setCurrentIndex(0); setScore(0); }}>Học lại</button>
        <button className="btn-primary" onClick={() => navigate('/flashcards')}>Quay lại danh sách</button>
      </div>
    </div>
  )

  return (
    <div className="flashcard-study">
      <header className="study-header">
        <button className="btn-back" onClick={() => navigate('/flashcards')}>← Thoát</button>
        <div className="study-progress">
          Thẻ {currentIndex + 1} / {cards.length}
        </div>
        <div className="mode-selector">
          <button className={mode === 'FLIP' ? 'active' : ''} onClick={() => {setMode('FLIP'); setCurrentIndex(0); setIsFinished(false);}}>Lật thẻ</button>
          <button className={mode === 'MCQ' ? 'active' : ''} onClick={() => {setMode('MCQ'); setCurrentIndex(0); setIsFinished(false);}}>Trắc nghiệm</button>
        </div>
      </header>

      <main className="study-content">
        {mode === 'FLIP' ? (
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
            <div className="flashcard-inner">
              <div className="flashcard-front">
                <div className="card-label">Front</div>
                <div className="card-text">{currentCard.frontText || currentCard.originalWord}</div>
                {currentCard.phonetic && <div className="card-phonetic">/{currentCard.phonetic}/</div>}
                <div className="card-hint">Nhấn để xem nghĩa</div>
              </div>
              <div className="flashcard-back">
                <div className="card-label">Back</div>
                <div className="card-text">{currentCard.backText || currentCard.meaningVi}</div>
                <div className="card-hint">Nhấn để quay lại</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mcq-container">
            <div className="mcq-question">
              <h2>{currentCard.frontText || currentCard.originalWord}</h2>
              <p>Chọn định nghĩa đúng:</p>
            </div>
            <div className="mcq-options">
              {mcqOptions.map((opt, idx) => (
                <button key={idx} className="mcq-option" onClick={() => handleAnswer(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="study-footer">
        {mode === 'FLIP' && (
          <div className="study-controls">
            <button className="btn-control" onClick={handlePrev} disabled={currentIndex === 0}>Trước</button>
            <button className="btn-control btn-primary" onClick={handleNext}>Tiếp theo</button>
          </div>
        )}
      </footer>
    </div>
  )
}
