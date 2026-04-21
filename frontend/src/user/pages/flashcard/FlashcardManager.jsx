import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import './Flashcard.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export default function FlashcardManager() {
  const [folders, setFolders] = useState([])
  const [decks, setDecks] = useState([])
  const [currentFolderId, setCurrentFolderId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [modalType, setModalType] = useState('DECK') // 'FOLDER', 'DECK', 'EDIT_FOLDER', 'EDIT_DECK'
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', folderId: '' })
  const navigate = useNavigate()
  const session = getUserSession()

  // Derived states
  const filteredDecks = useMemo(() => {
    return decks.filter(deck => {
      if (currentFolderId === null) return false // No decks in root, only folders
      return deck.folderId === currentFolderId
    })
  }, [decks, currentFolderId])

  const currentFolderName = useMemo(() => {
    if (currentFolderId === null) return null
    return folders.find(f => f.id === currentFolderId)?.name
  }, [folders, currentFolderId])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const authToken = localStorage.getItem('token') || session?.userId
      const headers = { 'Authorization': `Bearer ${authToken}` }
      
      const [foldersRes, decksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user/flashcards/folders`, { headers }),
        fetch(`${API_BASE_URL}/api/user/flashcards/decks`, { headers })
      ])

      if (foldersRes.ok) setFolders(await foldersRes.json())
      if (decksRes.ok) setDecks(await decksRes.json())
    } catch (error) {
      console.error('Error fetching flashcard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const authToken = localStorage.getItem('token') || session?.userId
      const method = (modalType === 'EDIT_FOLDER' || modalType === 'EDIT_DECK') ? 'PUT' : 'POST'
      const urlMap = {
        'FOLDER': `${API_BASE_URL}/api/user/flashcards/folders`,
        'EDIT_FOLDER': `${API_BASE_URL}/api/user/flashcards/folders/${editingItem?.id}`,
        'DECK': `${API_BASE_URL}/api/user/flashcards/decks`,
        'EDIT_DECK': `${API_BASE_URL}/api/user/flashcards/decks/${editingItem?.id}`
      }

      const response = await fetch(urlMap[modalType], {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({ name: '', description: '', folderId: '' })
        setEditingItem(null)
        fetchData()
      } else {
        const msg = await response.text()
        alert(msg || 'Lỗi khi xử lý')
      }
    } catch (error) {
      alert('Lỗi kết nối')
    }
  }

  const openCreateModal = (type, item = null) => {
    if (type === 'DECK' && folders.length === 0) {
      alert('Bạn cần tạo ít nhất một thư mục trước khi tạo bộ thẻ!')
      setModalType('FOLDER')
      setFormData({ name: '', description: '', folderId: '' })
    } else {
      setModalType(type)
      if (item) {
        setEditingItem(item)
        setFormData({ 
          name: item.name, 
          description: item.description || '', 
          folderId: (item.folderId || '').toString() 
        })
      } else {
        setEditingItem(null)
        setFormData({
          name: '',
          description: '',
          folderId: currentFolderId ? currentFolderId.toString() : (folders.length > 0 ? folders[0].id.toString() : '')
        })
      }
    }
    setShowCreateModal(true)
  }

  const handleDeleteFolder = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Xác nhận xóa thư mục này? Tất cả bộ thẻ bên trong sẽ bị mất liên kết thư mục.')) return
    const authToken = localStorage.getItem('token') || session?.userId
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/flashcards/folders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      if (res.ok) fetchData()
    } catch (err) { alert('Lỗi khi xóa thư mục') }
  }

  const handleDeleteDeck = async (id) => {
    if (!window.confirm('Xác nhận xóa bộ thẻ này?')) return
    const authToken = localStorage.getItem('token') || session?.userId
    try {
      await fetch(`${API_BASE_URL}/api/user/flashcards/decks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      fetchData()
    } catch (error) {
      alert('Lỗi khi xóa')
    }
  }

  if (isLoading) return <div className="flashcard-manager">Đang tải...</div>

  return (
    <div className="flashcard-manager fade-in">
      <header className="flashcard-header">
        <div className="header-title-group">
          <div className="breadcrumb">
            <span onClick={() => setCurrentFolderId(null)} className={currentFolderId === null ? 'active' : ''}>Tất cả</span>
            {currentFolderName && (
              <>
                <span className="separator">/</span>
                <span className="active">{currentFolderName}</span>
              </>
            )}
          </div>
          <h1>{currentFolderName || 'Bộ thẻ Flashcard'}</h1>
          <p>{currentFolderId ? `Bên trong thư mục ${currentFolderName}` : 'Quản lý và ôn tập từ vựng của bạn'}</p>
        </div>
        <div className="flashcard-header-actions">
          <button className="btn-secondary" onClick={() => openCreateModal('FOLDER')}>+ Thư mục</button>
          <button className="btn-primary" onClick={() => openCreateModal('DECK')}>+ Bộ thẻ mới</button>
        </div>
      </header>

      <section className="flashcard-grid">
        {/* Render Folders only in Root view */}
        {currentFolderId === null && folders.map(folder => (
          <div key={folder.id} className="folder-card slide-up" onClick={() => setCurrentFolderId(folder.id)}>
            <div className="folder-icon-wrapper">📂</div>
            <div className="folder-info">
              <h3>{folder.name}</h3>
              <p>{decks.filter(d => d.folderId === folder.id).length} bộ thẻ</p>
            </div>
            <div className="folder-card-actions">
              <button onClick={(e) => { e.stopPropagation(); openCreateModal('EDIT_FOLDER', folder); }} title="Sửa">✏️</button>
              <button onClick={(e) => handleDeleteFolder(e, folder.id)} title="Xóa">🗑️</button>
            </div>
            <div className="folder-arrow">→</div>
          </div>
        ))}

        {/* Render Decks */}
        {filteredDecks.map(deck => (
          <div key={deck.id} className="deck-card slide-up">
            <div className="deck-card-content" onClick={() => navigate(`/flashcards/study/${deck.id}`)}>
              <div className="deck-type-icon">🗂️</div>
              <h3>{deck.name}</h3>
              <p>{deck.description || 'Không có mô tả'}</p>
              <div className="deck-meta">
                <span>{deck.cardCount} thẻ</span>
                <span>{new Date(deck.updatedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            <div className="deck-card-actions">
              <button onClick={() => navigate(`/flashcards/deck-editor/${deck.id}`)} title="Quản lý thẻ">⚙️</button>
              <button onClick={() => openCreateModal('EDIT_DECK', deck)} title="Sửa">✏️</button>
              <button onClick={() => handleDeleteDeck(deck.id)} title="Xóa">🗑️</button>
            </div>
          </div>
        ))}

        {folders.length === 0 && decks.length === 0 && (
          <div className="empty-state">
            <p>Bạn chưa có nội dung nào. Hãy tạo bộ thẻ đầu tiên để bắt đầu học!</p>
          </div>
        )}
        
        {currentFolderId !== null && filteredDecks.length === 0 && (
          <div className="empty-state">
            <p>Thư mục này hiện đang trống.</p>
            <button className="btn-link" onClick={() => setCurrentFolderId(null)}>Quay lại</button>
          </div>
        )}
      </section>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>
              {modalType === 'FOLDER' && 'Tạo thư mục mới'}
              {modalType === 'EDIT_FOLDER' && 'Sửa thư mục'}
              {modalType === 'DECK' && 'Tạo bộ thẻ mới'}
              {modalType === 'EDIT_DECK' && 'Sửa bộ thẻ'}
            </h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Tên</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Nhập tên..."
                  required 
                />
              </div>
              {(modalType === 'DECK' || modalType === 'EDIT_DECK') && (
                <>
                  <div className="form-group">
                    <label>Mô tả</label>
                    <textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Mô tả bộ thẻ..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Thư mục</label>
                    <select 
                      value={formData.folderId} 
                      onChange={e => setFormData({...formData, folderId: e.target.value})}
                      required
                    >
                      <option value="" disabled>— Chọn thư mục —</option>
                      {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
