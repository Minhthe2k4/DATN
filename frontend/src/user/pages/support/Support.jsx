import { useEffect, useRef, useState } from 'react'
import './support.css'
import { fetchFAQ, fetchSupportTopics, submitSupportTicket, fetchUserTickets, fetchTicketResponses, replyToTicket } from '@/lib/api/support-api'
import { getUserSession } from '../../utils/authSession'
import {
  Send, Plus, MessageCircle, ChevronRight, CheckCircle2,
  Clock, AlertCircle, HelpCircle, X, ArrowLeft, User, Shield
} from 'lucide-react'

const DEFAULT_TOPICS = [
  { id: 1, label: 'Tài khoản & đăng nhập', icon: '🔐' },
  { id: 2, label: 'Thanh toán & Premium', icon: '💳' },
  { id: 3, label: 'Nội dung học tập', icon: '📚' },
  { id: 4, label: 'Tính năng ứng dụng', icon: '⚙️' },
  { id: 5, label: 'Báo lỗi ứng dụng', icon: '🐛' },
  { id: 6, label: 'Câu hỏi khác', icon: '💬' },
]

const DEFAULT_FAQ = [
  { question: 'Tôi quên mật khẩu, phải làm gì?', answer: 'Vào trang Đăng nhập, nhấn "Quên mật khẩu?" rồi nhập email đã đăng ký. Hệ thống sẽ gửi link đặt lại mật khẩu trong vòng vài phút.' },
  { question: 'Tôi đã thanh toán nhưng chưa được nâng cấp Premium?', answer: 'Sau khi thanh toán thành công, tài khoản thường được nâng cấp ngay lập tức. Nếu sau 15 phút vẫn chưa thấy thay đổi, thử đăng xuất và đăng nhập lại.' },
  { question: 'Làm sao để xóa tài khoản?', answer: 'Vào Cài đặt → Tài khoản → Xóa tài khoản. Lưu ý dữ liệu học tập sẽ bị xóa vĩnh viễn và không thể khôi phục.' },
  { question: 'Tính năng Spaced Repetition hoạt động như thế nào?', answer: 'Hệ thống theo dõi các từ bạn đã học và nhắc lại đúng lúc bạn sắp quên — dựa trên thuật toán ghi nhớ khoa học SM-2.' },
  { question: 'Tôi có thể học ngoại tuyến không?', answer: 'Tính năng học ngoại tuyến chỉ dành cho tài khoản Premium.' },
  { question: 'Tại sao video không phát được?', answer: 'Video được nhúng từ YouTube nên cần kết nối internet ổn định. Kiểm tra kết nối mạng và thử tải lại trang.' },
]

function statusBadge(status) {
  const map = {
    OPEN:        { label: 'Đang mở',    color: '#3b82f6', bg: '#eff6ff' },
    IN_PROGRESS: { label: 'Đang xử lý', color: '#f59e0b', bg: '#fffbeb' },
    RESOLVED:    { label: 'Đã giải quyết', color: '#10b981', bg: '#ecfdf5' },
    CLOSED:      { label: 'Đã đóng',    color: '#6b7280', bg: '#f9fafb' },
  }
  return map[status] || map.OPEN
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  return d.toLocaleDateString('vi-VN')
}

// ─── NEW CHAT WIZARD ────────────────────────────────────────────────────────
function NewChatWizard({ topics, onStart, onClose, defaultName, defaultEmail, isLoggedIn }) {
  const [step, setStep] = useState('topic') // 'topic' | 'info' | 'chat'
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [name, setName] = useState(defaultName || '')
  const [email, setEmail] = useState(defaultEmail || '')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)

  async function handleSend() {
    const errs = {}
    if (!name.trim()) errs.name = 'Vui lòng nhập tên.'
    if (!isLoggedIn && !email.trim()) errs.email = 'Vui lòng nhập email.'
    if (!message.trim()) errs.message = 'Vui lòng nhập nội dung.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSending(true)
    try {
      const ticket = await submitSupportTicket({
        topic: selectedTopic.label,
        message: message.trim(),
        email: email || null,
        name: name.trim(),
      })
      onStart(ticket)
    } catch (e) {
      setErrors({ message: e.message || 'Gửi thất bại, thử lại sau.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat-wizard">
      <div className="chat-wizard__header">
        {step !== 'topic' && (
          <button className="chat-wizard__back" onClick={() => setStep(step === 'chat' ? 'info' : 'topic')}>
            <ArrowLeft size={18} />
          </button>
        )}
        <span>{step === 'topic' ? 'Chọn chủ đề hỗ trợ' : step === 'info' ? 'Thông tin liên hệ' : 'Mô tả vấn đề'}</span>
        <button className="chat-wizard__close" onClick={onClose}><X size={18} /></button>
      </div>

      {step === 'topic' && (
        <div className="chat-wizard__topics">
          <p className="chat-wizard__hint">Chọn vấn đề bạn cần hỗ trợ để chúng tôi giúp bạn nhanh hơn.</p>
          <div className="topic-grid">
            {topics.map((t, i) => (
              <button key={i} className="topic-card" onClick={() => { setSelectedTopic(typeof t === 'string' ? { label: t, icon: '💬' } : t); setStep(isLoggedIn ? 'chat' : 'info') }}>
                <span className="topic-card__icon">{typeof t === 'string' ? '💬' : t.icon}</span>
                <span className="topic-card__label">{typeof t === 'string' ? t : t.label}</span>
                <ChevronRight size={14} className="topic-card__arrow" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'info' && (
        <div className="chat-wizard__info">
          <div className="wizard-field">
            <label>Họ và tên *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nguyễn Văn A" />
            {errors.name && <span className="wizard-error">{errors.name}</span>}
          </div>
          <div className="wizard-field">
            <label>Email liên hệ *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
            {errors.email && <span className="wizard-error">{errors.email}</span>}
          </div>
          <button className="wizard-next-btn" onClick={() => setStep('chat')}>Tiếp theo →</button>
        </div>
      )}

      {step === 'chat' && (
        <div className="chat-wizard__compose">
          {!isLoggedIn && (
            <div className="wizard-field">
              <label>Họ và tên *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nguyễn Văn A" />
              {errors.name && <span className="wizard-error">{errors.name}</span>}
            </div>
          )}
          <div className="wizard-selected-topic">
            <span>{selectedTopic?.icon || '💬'}</span>
            <span>{selectedTopic?.label}</span>
          </div>
          <div className="wizard-field">
            <label>Mô tả vấn đề của bạn *</label>
            <textarea
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải để chúng tôi có thể hỗ trợ bạn tốt hơn..."
            />
            {errors.message && <span className="wizard-error">{errors.message}</span>}
          </div>
          <button className="wizard-send-btn" onClick={handleSend} disabled={sending}>
            {sending ? 'Đang gửi...' : <><Send size={16} /> Gửi yêu cầu</>}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── CHAT WINDOW ─────────────────────────────────────────────────────────────
function ChatWindow({ ticket, responses, loading, userName, onNewResponse }) {
  const bottomRef = useRef(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyError, setReplyError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [responses])

  async function handleSendReply(e) {
    e.preventDefault()
    if (!replyText.trim() || sending) return
    setSending(true)
    setReplyError('')
    try {
      const newResponse = await replyToTicket(ticket.id, replyText.trim())
      onNewResponse?.(newResponse)
      setReplyText('')
      inputRef.current?.focus()
    } catch (err) {
      setReplyError('Gửi thất bại. Vui lòng thử lại.')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendReply(e)
    }
  }

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED'
  const badge = statusBadge(ticket.status)

  return (
    <div className="chat-window">
      <div className="chat-window__header">
        <div className="chat-window__info">
          <div className="chat-window__title">{ticket.title || ticket.topic || 'Yêu cầu hỗ trợ'}</div>
          <span className="chat-status-badge" style={{ color: badge.color, background: badge.bg }}>
            {badge.label}
          </span>
        </div>
        <div className="chat-window__meta">Mã #{ticket.id} • {timeAgo(ticket.createdAt)}</div>
      </div>

      <div className="chat-messages">
        {/* Original message from user */}
        <div className="chat-msg chat-msg--user">
          <div className="chat-msg__avatar chat-msg__avatar--user"><User size={14} /></div>
          <div className="chat-msg__bubble">
            <div className="chat-msg__text">{ticket.message}</div>
            <div className="chat-msg__time">{timeAgo(ticket.createdAt)}</div>
          </div>
        </div>

        {loading && (
          <div className="chat-msg chat-msg--admin">
            <div className="chat-msg__avatar chat-msg__avatar--admin"><Shield size={14} /></div>
            <div className="chat-msg__bubble chat-msg__bubble--loading">
              <span /><span /><span />
            </div>
          </div>
        )}

        {!loading && responses.length === 0 && (
          <div className="chat-empty-state">
            <Clock size={24} />
            <p>Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ.</p>
          </div>
        )}

        {!loading && responses.map(res => {
          const isAdminMsg = res.admin != null
          return isAdminMsg ? (
            <div key={res.id} className="chat-msg chat-msg--admin">
              <div className="chat-msg__avatar chat-msg__avatar--admin"><Shield size={14} /></div>
              <div className="chat-msg__bubble">
                <div className="chat-msg__sender">Hỗ trợ viên</div>
                <div className="chat-msg__text">{res.response}</div>
                <div className="chat-msg__time">{timeAgo(res.createdAt)}</div>
              </div>
            </div>
          ) : (
            <div key={res.id} className="chat-msg chat-msg--user">
              <div className="chat-msg__avatar chat-msg__avatar--user"><User size={14} /></div>
              <div className="chat-msg__bubble">
                <div className="chat-msg__text">{res.response}</div>
                <div className="chat-msg__time">{timeAgo(res.createdAt)}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Reply Input ── */}
      {isClosed ? (
        <div className="chat-reply-closed">
          <CheckCircle2 size={14} />
          Yêu cầu này đã được đóng. Tạo yêu cầu mới nếu bạn cần thêm hỗ trợ.
        </div>
      ) : (
        <form className="chat-reply-bar" onSubmit={handleSendReply}>
          {replyError && <div className="chat-reply-error">{replyError}</div>}
          <textarea
            ref={inputRef}
            className="chat-reply-input"
            placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={sending}
          />
          <button
            type="submit"
            className={`chat-reply-send ${replyText.trim() ? 'is-active' : ''}`}
            disabled={!replyText.trim() || sending}
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  )
}

// ─── FAQ PANEL ───────────────────────────────────────────────────────────────
function FaqPanel({ items }) {
  const [open, setOpen] = useState(null)
  return (
    <div className="faq-panel">
      <div className="faq-panel__title"><HelpCircle size={16} /> Câu hỏi thường gặp</div>
      {items.map((item, i) => (
        <div key={i} className={`faq-item ${open === i ? 'faq-item--open' : ''}`}>
          <button className="faq-item__q" onClick={() => setOpen(open === i ? null : i)}>
            <span>{item.question}</span>
            <ChevronRight size={16} className="faq-item__icon" />
          </button>
          {open === i && <div className="faq-item__a">{item.answer}</div>}
        </div>
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function Support() {
  const session = getUserSession()
  const isLoggedIn = !!session

  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [responses, setResponses] = useState([])
  const [responsesLoading, setResponsesLoading] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [showFaq, setShowFaq] = useState(false)
  const [faqItems, setFaqItems] = useState(DEFAULT_FAQ)
  const [topicOptions, setTopicOptions] = useState(DEFAULT_TOPICS)
  const [userProfile, setUserProfile] = useState(null)
  const [ticketsLoading, setTicketsLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    async function load() {
      const [faq, topics] = await Promise.all([fetchFAQ(), fetchSupportTopics()])
      if (faq?.length) setFaqItems(faq)
      if (topics?.length) {
        // Enrich with icons if plain strings
        const enriched = topics.map((t, i) => typeof t === 'string'
          ? (DEFAULT_TOPICS[i] || { label: t, icon: '💬' })
          : t)
        setTopicOptions(enriched)
      }

      if (isLoggedIn) {
        // Fetch profile for pre-fill
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${session.userId}` }
          })
          if (res.ok) setUserProfile(await res.json())
        } catch (_) {}

        // Fetch ticket list
        setTicketsLoading(true)
        try {
          const list = await fetchUserTickets()
          setTickets(list || [])
        } catch (_) {} finally {
          setTicketsLoading(false)
        }
      }
    }
    load()
  }, [isLoggedIn, session?.userId])

  // Load responses when ticket selected
  useEffect(() => {
    if (!selectedTicket) { setResponses([]); return }
    setResponsesLoading(true)
    fetchTicketResponses(selectedTicket.id)
      .then(r => setResponses(r || []))
      .finally(() => setResponsesLoading(false))
  }, [selectedTicket])

  // ─── Real-time: auto-refresh when admin replies ───────────────────────────
  useEffect(() => {
    function handleNewNotification(event) {
      const notif = event.detail
      if (!notif || notif.type !== 'SUPPORT_REPLY') return

      // payload từ WebSocket: { type, message, data: { id: ticketId, ... } }
      const notifTicketId = notif.data?.id ?? notif.ticketId ?? notif.relatedId

      if (selectedTicket) {
        // Nếu không có ticketId trong notif, hoặc khớp với ticket đang mở → refresh
        if (notifTicketId == null || String(notifTicketId) === String(selectedTicket.id)) {
          fetchTicketResponses(selectedTicket.id)
            .then(r => setResponses(r || []))
        }
      }
    }
    window.addEventListener('new-notification', handleNewNotification)
    return () => window.removeEventListener('new-notification', handleNewNotification)
  }, [selectedTicket])

  function handleNewTicket(ticket) {
    setTickets(prev => [ticket, ...prev])
    setSelectedTicket(ticket)
    setShowWizard(false)
  }

  const userName = userProfile?.fullName || userProfile?.username || session?.username || ''
  const userEmail = userProfile?.email || session?.email || ''

  return (
    <div className="support-app">
      {/* ── Sidebar ── */}
      <aside className="support-sidebar">
        <div className="support-sidebar__header">
          <div className="support-sidebar__title">
            <MessageCircle size={20} />
            <span>Hỗ trợ</span>
          </div>
          <button
            className="support-sidebar__new-btn"
            onClick={() => { setShowWizard(true); setShowFaq(false) }}
            title="Tạo yêu cầu mới"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* FAQ button */}
        <button
          className={`support-sidebar__faq-btn ${showFaq && !showWizard && !selectedTicket ? 'is-active' : ''}`}
          onClick={() => { setShowFaq(true); setShowWizard(false); setSelectedTicket(null) }}
        >
          <HelpCircle size={16} />
          <span>Câu hỏi thường gặp</span>
        </button>

        <div className="support-sidebar__section-label">Yêu cầu của tôi</div>

        {!isLoggedIn && (
          <div className="support-sidebar__login-hint">
            <AlertCircle size={14} />
            Đăng nhập để xem lịch sử hỗ trợ
          </div>
        )}

        {ticketsLoading && <div className="support-sidebar__loading">Đang tải...</div>}

        {isLoggedIn && !ticketsLoading && tickets.length === 0 && (
          <div className="support-sidebar__empty">Chưa có yêu cầu nào</div>
        )}

        <div className="support-sidebar__list">
          {tickets.map(t => {
            const badge = statusBadge(t.status)
            return (
              <button
                key={t.id}
                className={`ticket-item ${selectedTicket?.id === t.id ? 'ticket-item--active' : ''}`}
                onClick={() => { setSelectedTicket(t); setShowWizard(false); setShowFaq(false) }}
              >
                <div className="ticket-item__topic">{t.title || t.topic || 'Yêu cầu hỗ trợ'}</div>
                <div className="ticket-item__preview">{t.message?.slice(0, 60)}...</div>
                <div className="ticket-item__footer">
                  <span className="ticket-item__badge" style={{ color: badge.color }}>{badge.label}</span>
                  <span className="ticket-item__time">{timeAgo(t.createdAt)}</span>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <main className="support-main">
        {showWizard && (
          <NewChatWizard
            topics={topicOptions}
            onStart={handleNewTicket}
            onClose={() => setShowWizard(false)}
            defaultName={userName}
            defaultEmail={userEmail}
            isLoggedIn={isLoggedIn}
          />
        )}

        {!showWizard && showFaq && !selectedTicket && (
          <FaqPanel items={faqItems} />
        )}

        {!showWizard && selectedTicket && (
          <ChatWindow
            ticket={selectedTicket}
            responses={responses}
            loading={responsesLoading}
            userName={userName}
            onNewResponse={(res) => setResponses(prev => [...prev, res])}
          />
        )}

        {!showWizard && !selectedTicket && !showFaq && (
          <div className="support-welcome">
            <div className="support-welcome__icon">💬</div>
            <h2>Trung tâm hỗ trợ</h2>
            <p>Chọn một yêu cầu từ danh sách hoặc tạo yêu cầu mới để bắt đầu trò chuyện với đội ngũ hỗ trợ.</p>
            <div className="support-welcome__actions">
              <button className="support-welcome__btn support-welcome__btn--primary" onClick={() => setShowWizard(true)}>
                <Plus size={16} /> Tạo yêu cầu mới
              </button>
              <button className="support-welcome__btn" onClick={() => setShowFaq(true)}>
                <HelpCircle size={16} /> Xem câu hỏi thường gặp
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Support
