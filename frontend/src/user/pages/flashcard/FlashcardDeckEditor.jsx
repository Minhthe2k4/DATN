import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import './Flashcard.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export default function FlashcardDeckEditor() {
  const { deckId } = useParams()
  const navigate = useNavigate()
  const session = getUserSession()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCardModal, setShowCardModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [cardForm, setCardForm] = useState({ frontText: '', backText: '' })

  useEffect(() => {
    fetchData()
  }, [deckId])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const authToken = localStorage.getItem('token') || session?.userId
      const headers = { 'Authorization': `Bearer ${authToken}` }
      
      const [deckRes, cardsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user/flashcards/decks`, { headers }),
        fetch(`${API_BASE_URL}/api/user/flashcards/decks/${deckId}/cards`, { headers })
      ])

      if (deckRes.ok) {
        const allDecks = await deckRes.json()
        setDeck(allDecks.find(d => d.id.toString() === deckId))
      }
      if (cardsRes.ok) setCards(await cardsRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCard = async (e) => {
    e.preventDefault()
    const authToken = localStorage.getItem('token') || session?.userId
    const isEdit = !!editingCard
    const url = isEdit 
      ? `${API_BASE_URL}/api/user/flashcards/cards/${editingCard.id}`
      : `${API_BASE_URL}/api/user/flashcards/decks/${deckId}/cards`
    
    try {
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(cardForm)
      })

      if (response.ok) {
        setShowCardModal(false)
        fetchData()
      }
    } catch (err) { alert('Lỗi khi lưu thẻ') }
  }

  const handleDeleteCard = async (id) => {
    if (!window.confirm('Xóa thẻ này?')) return
    const authToken = localStorage.getItem('token') || session?.userId
    try {
      await fetch(`${API_BASE_URL}/api/user/flashcards/cards/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      fetchData()
    } catch (err) { alert('Lỗi khi xóa thẻ') }
  }

  const openCardModal = (card = null) => {
    if (card) {
      setEditingCard(card)
      setCardForm({ frontText: card.frontText, backText: card.backText })
    } else {
      setEditingCard(null)
      setCardForm({ frontText: '', backText: '' })
    }
    setShowCardModal(true)
  }

  if (isLoading) return <div className="deck-editor">Đang tải...</div>
  if (!deck) return <div className="deck-editor">Không tìm thấy bộ thẻ.</div>

  return (
    <div className="deck-editor fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button className="btn-secondary" onClick={() => navigate('/flashcards')} style={{ marginBottom: '1rem' }}>← Quay lại</button>
          <h1>Quản lý thẻ: {deck.name}</h1>
          <p>{cards.length} thẻ trong bộ này</p>
        </div>
        <button className="btn-primary" onClick={() => openCardModal()}>+ Thêm thẻ mới</button>
      </header>

      <div className="cards-list" style={{ display: 'grid', gap: '1rem' }}>
        {cards.map(card => (
          <div key={card.id} className="card-item" style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '1rem', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #edf2f7'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '0.25rem' }}>{card.frontText || card.originalWord}</div>
              <div style={{ color: '#718096', fontSize: '0.9rem' }}>{card.backText || card.meaningVi}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" style={{ padding: '0.5rem' }} onClick={() => openCardModal(card)}>✏️</button>
              <button className="btn-secondary" style={{ padding: '0.5rem', color: '#e53e3e' }} onClick={() => handleDeleteCard(card.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showCardModal && (
        <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingCard ? 'Sửa thẻ' : 'Thêm thẻ mới'}</h2>
            <form onSubmit={handleSaveCard}>
              <div className="form-group">
                <label>Mặt trước (Từ vựng)</label>
                <input 
                  type="text" 
                  value={cardForm.frontText} 
                  onChange={e => setCardForm({...cardForm, frontText: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Mặt sau (Nghĩa/Giải thích)</label>
                <textarea 
                  value={cardForm.backText} 
                  onChange={e => setCardForm({...cardForm, backText: e.target.value})} 
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCardModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
