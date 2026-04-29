import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAdminSession } from '../../utils/adminSession'
import {
  AdminPageHeader,
  AdminSectionCard,
  Badge,
} from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const STATUS_OPTIONS = ['Chờ xử lý', 'Đang xử lý', 'Đã giải quyết']

function formatDate(value) {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '---'
  return date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function SupportDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [ticket, setTicket] = useState(null)
  const [responses, setResponses] = useState([])
  const [replyText, setReplyText] = useState('')
  const [replyError, setReplyError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const fetchTicketDetails = async () => {
    try {
      const session = getAdminSession()
      const headers = { 'Authorization': `Bearer ${session?.token || localStorage.getItem('token')}` }
      
      const ticketRes = await fetch(`${API_BASE_URL}/api/admin/support/tickets/${id}`, { headers })
      if (!ticketRes.ok) throw new Error('Cannot fetch ticket')
      const ticketData = await ticketRes.json()
      setTicket(ticketData)

      const responsesRes = await fetch(`${API_BASE_URL}/api/admin/support/tickets/${id}/responses`, { headers })
      if (responsesRes.ok) {
        setResponses(await responsesRes.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTicketDetails()

    // Lắng nghe tin nhắn mới từ User để cập nhật Real-time
    const handleNewNotification = (event) => {
      const notif = event.detail
      if (!notif) return

      // Nếu có tin nhắn mới từ User cho chính Ticket này
      if (notif.type === 'USER_SUPPORT_REPLY' && String(notif.data?.ticketId) === String(id)) {
        // Cập nhật danh sách responses
        const newMsg = {
          id: Date.now() + Math.random(),
          response: notif.data.message,
          admin: null,
          createdAt: notif.data.createdAt || new Date().toISOString()
        }
        
        setResponses(prev => {
          // Tránh trùng lặp
          const exists = prev.some(r => r.response === newMsg.response && Math.abs(new Date(r.createdAt) - new Date(newMsg.createdAt)) < 2000)
          if (exists) return prev
          return [...prev, newMsg]
        })
      }
    }

    window.addEventListener('new-notification', handleNewNotification)
    return () => window.removeEventListener('new-notification', handleNewNotification)
  }, [id])

  const handleStatusChange = async (newStatus) => {
    try {
      const session = getAdminSession()
      const response = await fetch(`${API_BASE_URL}/api/admin/support/tickets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        const updated = await response.json()
        setTicket(updated)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      setReplyError('Vui lòng nhập nội dung phản hồi.')
      return
    }

    setIsSending(true)
    const session = getAdminSession()
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/support/tickets/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          response: replyText.trim(),
          status: 'Đang xử lý',
        }),
      })

      if (!response.ok) throw new Error('Cannot send reply')

      const updatedTicket = await response.json()
      setTicket(updatedTicket)
      setResponses((prev) => [...prev, {
        id: Date.now(),
        response: replyText.trim(),
        admin: { id: session?.userId },
        createdAt: new Date().toISOString()
      }])
      setReplyText('')
      setReplyError('')
    } catch (err) {
      setReplyError('Không thể gửi phản hồi.')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return <div className="page-content"><div className="container-fluid text-center mt-5">Đang tải chi tiết yêu cầu...</div></div>
  }

  if (!ticket) {
    return <div className="page-content"><div className="container-fluid text-center mt-5">Không tìm thấy yêu cầu hỗ trợ.</div></div>
  }

  const statusTone = (status) => {
    if (status === 'Đã giải quyết') return 'success'
    if (status === 'Đang xử lý') return 'warning'
    return 'neutral'
  }

  return (
    <div className="page-content py-3 bg-light min-vh-100">
      <div className="container-fluid">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 bg-white p-3 rounded-3 shadow-sm border">
          <div>
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-sm btn-light border-0 p-1" onClick={() => navigate('/admin/support')}>
                <i className="iconoir-nav-arrow-left fs-5"></i>
              </button>
              <h5 className="mb-0 fw-bold">{ticket.topic || 'Hỗ trợ kỹ thuật'}</h5>
              <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
            </div>
            <div className="small text-muted ms-4 ps-2">Mã vé: #{ticket.id} • {formatDate(ticket.createdAt)}</div>
          </div>
          <div className="text-end d-none d-md-block">
             <div className="fw-bold small">{ticket.userName}</div>
             <div className="text-primary small" style={{ fontSize: '0.75rem' }}>{ticket.email}</div>
          </div>
        </div>

        <div className="row g-3">
          {/* Left Column: Chat History */}
          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-3 shadow-sm border d-flex flex-column" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Message Header */}
              <div className="p-3 border-bottom bg-light rounded-top-3">
                <h6 className="mb-0 small fw-bold text-uppercase text-muted">Cuộc hội thoại</h6>
              </div>

              {/* Chat Content */}
              <div className="flex-grow-1 p-4 overflow-y-auto d-flex flex-column gap-3" style={{ background: '#fdfcfe' }}>
                {/* User's Original Message (Left) */}
                <div className="d-flex flex-column align-items-start">
                  <div className="p-3 shadow-sm border-0" style={{ maxWidth: '80%', background: '#f1f5f9', color: '#1e293b', borderRadius: '20px 20px 20px 4px' }}>
                    <div className="small fw-bold mb-1" style={{ color: '#64748b', fontSize: '0.7rem' }}>👤 {ticket.userName}</div>
                    <div className="small" style={{ lineHeight: 1.5 }}>{ticket.message}</div>
                    <div className="mt-2 opacity-50" style={{ fontSize: '0.6rem' }}>{formatDate(ticket.createdAt)}</div>
                  </div>
                </div>

                {responses.map((item) => {
                  const isAdmin = item.admin != null
                  return (
                    <div key={item.id} className={`d-flex flex-column ${isAdmin ? 'align-items-end' : 'align-items-start'}`}>
                      <div 
                        className={`p-3 shadow-sm border-0 ${isAdmin ? 'text-white' : 'text-dark'}`} 
                        style={{ 
                          maxWidth: '80%', 
                          background: isAdmin ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#f1f5f9',
                          borderRadius: isAdmin ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                          boxShadow: isAdmin ? '0 4px 12px rgba(79, 70, 229, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div className={`small fw-bold mb-1 ${isAdmin ? 'opacity-75' : ''}`} style={{ fontSize: '0.7rem', color: isAdmin ? '#fff' : '#64748b' }}>
                          {isAdmin ? '🛠️ Bạn (Hỗ trợ viên)' : `👤 ${ticket.userName}`}
                        </div>
                        <div className="small" style={{ lineHeight: 1.5 }}>{item.response}</div>
                        <div className={`mt-2 ${isAdmin ? 'opacity-50' : 'opacity-40'}`} style={{ fontSize: '0.6rem', textAlign: isAdmin ? 'right' : 'left' }}>
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Message Input Area */}
              <div className="p-3 border-top bg-white rounded-bottom-4">
                <div className="px-2 py-1 bg-light rounded-4 d-flex align-items-center">
                  <textarea
                    className="form-control border-0 bg-transparent"
                    rows={1}
                    placeholder="Nhập tin nhắn phản hồi..."
                    value={replyText}
                    onChange={(e) => { setReplyText(e.target.value); setReplyError('') }}
                    disabled={isSending}
                    style={{ resize: 'none', boxShadow: 'none', fontSize: '0.9rem' }}
                  />
                  <button 
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 ms-2" 
                    onClick={handleSendReply}
                    disabled={isSending || !replyText.trim()}
                    style={{ width: '36px', height: '36px', flexShrink: 0, background: '#4f46e5' }}
                  >
                    <i className="iconoir-send fs-5"></i>
                  </button>
                </div>
                {replyError && <div className="text-danger mt-1 small ps-3" style={{ fontSize: '0.7rem' }}>{replyError}</div>}
              </div>
            </div>
          </div>

          {/* Right Column: Ticket Actions */}
          <div className="col-12 col-lg-4">
            <div className="bg-white rounded-3 shadow-sm border p-3">
              <h6 className="fw-bold mb-3 small text-uppercase text-muted border-bottom pb-2">Thông tin vé & Trạng thái</h6>
              
              <div className="mb-3">
                <label className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Trạng thái hiện tại</label>
                <select
                  className="form-select form-select-sm fw-bold border-2"
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Ngày gửi</div>
                <div className="small fw-bold">{formatDate(ticket.createdAt)}</div>
              </div>

              <div className="mb-3">
                <div className="small text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Khách hàng</div>
                <div className="fw-bold small">{ticket.userName}</div>
                <div className="text-primary small" style={{ fontSize: '0.7rem' }}>{ticket.email}</div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <button 
                  className="btn btn-sm btn-outline-danger w-100 fw-bold py-2"
                  onClick={() => handleStatusChange('Đã giải quyết')}
                  style={{ borderRadius: '8px' }}
                >
                  🔒 Đóng Ticket Này
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
