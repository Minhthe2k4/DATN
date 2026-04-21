import { useEffect, useMemo, useState } from 'react'
import { supportTickets } from '../../data/adminData'
import {
  AdminPageHeader,
  AdminSectionCard,
  Badge,
  FilterTabs,
  SimpleTable,
  StatGrid,
} from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const STATUS_OPTIONS = ['Chờ xử lý', 'Đang xử lý', 'Đã giải quyết']

function formatDate(value) {
  if (!value) {
    return '---'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '---'
  }
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SupportManagement() {
  const [tickets, setTickets] = useState(supportTickets)
  const [activeFilter, setActiveFilter] = useState('Tất cả')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replyError, setReplyError] = useState('')
  const [loadError, setLoadError] = useState('')

  // Nâng cấp: Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')

  const normalizeRow = (item) => ({
    id: item.id,
    userName: item.userName || 'Người dùng',
    email: item.email || '(không có email)',
    topic: item.topic || 'Hỗ trợ',
    message: item.message || '',
    status: item.status || 'Chờ xử lý',
    createdAt: formatDate(item.createdAt),
    responses: Array.isArray(item.responses) ? item.responses : [],
  })

  const loadTickets = async (statusFilter = activeFilter) => {
    const status = statusFilter === 'Tất cả' ? 'ALL' : statusFilter
    const query = new URLSearchParams({ status, limit: '200' })

    const response = await fetch(`${API_BASE_URL}/api/admin/support/tickets?${query.toString()}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    if (!response.ok) {
      throw new Error('Cannot fetch support tickets')
    }

    const payload = await response.json()
    setTickets(Array.isArray(payload) ? payload.map(normalizeRow) : supportTickets)
  }

  useEffect(() => {
    loadTickets('Tất cả')
      .then(() => setLoadError(''))
      .catch(() => setLoadError('Không thể tải ticket hỗ trợ từ backend, đang hiển thị dữ liệu mẫu.'))
  }, [])

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus = activeFilter === 'Tất cả' ? true : t.status === activeFilter
      const normalizedSearch = searchTerm.toLowerCase()
      const matchesSearch = t.userName.toLowerCase().includes(normalizedSearch) ||
        t.email.toLowerCase().includes(normalizedSearch) ||
        t.message.toLowerCase().includes(normalizedSearch) ||
        t.id.toLowerCase().includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [tickets, activeFilter, searchTerm])

  const openTicket = (ticket) => {
    setSelectedTicket(ticket)
    setReplyText('')
    setReplyError('')
  }

  const closeTicket = () => {
    setSelectedTicket(null)
    setReplyError('')
  }

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/support/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Cannot update status')
      }

      const updated = normalizeRow(await response.json())
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)))
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updated)
      }
      setLoadError('')
    } catch {
      setLoadError('Không thể cập nhật trạng thái ticket.')
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      setReplyError('Vui lòng nhập nội dung phản hồi.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          adminEmail: window.localStorage.getItem('admin_actor') || '',
          response: replyText.trim(),
          status: 'Đã giải quyết',
        }),
      })

      if (!response.ok) {
        throw new Error('Cannot send reply')
      }

      const updated = normalizeRow(await response.json())
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      closeTicket()
      setLoadError('')
    } catch {
      setReplyError('Không thể gửi phản hồi cho ticket này.')
    }
  }

  const stats = [
    {
      label: 'Tổng yêu cầu',
      value: tickets.length.toString(),
      meta: 'Từ người dùng gửi qua trang hỗ trợ',
      icon: 'iconoir-chat-lines',
    },
    {
      label: 'Chờ xử lý',
      value: tickets.filter((t) => t.status === 'Chờ xử lý').length.toString(),
      meta: 'Cần được phân công xử lý',
      icon: 'iconoir-clock',
    },
    {
      label: 'Đang xử lý',
      value: tickets.filter((t) => t.status === 'Đang xử lý').length.toString(),
      meta: 'Đã tiếp nhận, chưa hoàn tất',
      icon: 'iconoir-refresh-double',
    },
    {
      label: 'Đã giải quyết',
      value: tickets.filter((t) => t.status === 'Đã giải quyết').length.toString(),
      meta: 'Đã phản hồi hoặc đóng vé',
      icon: 'iconoir-check-circle',
    },
  ]

  const statusTone = (status) => {
    if (status === 'Đã giải quyết') return 'success'
    if (status === 'Đang xử lý') return 'warning'
    return 'neutral'
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Support Desk"
          title="Hỗ trợ người dùng"
          description="Tiếp nhận và xử lý yêu cầu hỗ trợ từ người dùng. Phản hồi nhanh để cải thiện trải nghiệm học tập."
          actions={<button type="button" className="btn btn-outline-primary" onClick={() => loadTickets(activeFilter)}>Làm mới ticket</button>}
        />

        <StatGrid items={stats} />
        {loadError ? <div className="alert alert-warning mt-3 mb-0">{loadError}</div> : null}

        <div className="row g-3 mt-1">
          <div className="col-12">
            <AdminSectionCard
              title="Danh sách yêu cầu hỗ trợ"
              description="Lọc theo trạng thái để ưu tiên xử lý vé chờ và đang thực hiện."
            >
              <div className="mb-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
                <FilterTabs
                  items={['Tất cả', 'Chờ xử lý', 'Đang xử lý', 'Đã giải quyết']}
                  active={activeFilter}
                  onChange={(value) => {
                    setActiveFilter(value)
                    loadTickets(value).catch(() => setLoadError('Không thể lọc ticket theo trạng thái.'))
                  }}
                />
                <div className="input-group input-group-sm" style={{ width: '300px' }}>
                  <span className="input-group-text bg-light border-end-0">
                    <i className="iconoir-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Tìm theo Mã vé, Email hoặc nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <SimpleTable
                columns={[
                  { key: 'id', label: 'Mã vé' },
                  { key: 'userName', label: 'Người dùng' },
                  { key: 'topic', label: 'Chủ đề' },
                  {
                    key: 'message',
                    label: 'Nội dung',
                    render: (row) => (
                      <span title={row.message} style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {row.message}
                      </span>
                    ),
                  },
                  { key: 'createdAt', label: 'Ngày gửi' },
                  {
                    key: 'status',
                    label: 'Trạng thái',
                    render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge>,
                  },
                  {
                    key: 'actions',
                    label: 'Hành động',
                    render: (row) => (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openTicket(row)}
                      >
                        Xem & phản hồi
                      </button>
                    ),
                  },
                ]}
                rows={filteredTickets}
              />
            </AdminSectionCard>
          </div>
        </div>
      </div>

      {selectedTicket ? (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content topic-bulk-modal">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title mb-1">Yêu cầu {selectedTicket.id}</h5>
                    <div className="topic-bulk-modal__subtitle">
                      {selectedTicket.userName} &middot; {selectedTicket.email} &middot; {selectedTicket.createdAt}
                    </div>
                  </div>
                  <button type="button" className="btn-close" aria-label="Đóng" onClick={closeTicket}></button>
                </div>
                <div className="modal-body">
                  <div className="topic-bulk-hero mb-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="fw-semibold">{selectedTicket.topic}</div>
                      <Badge tone={statusTone(selectedTicket.status)}>{selectedTicket.status}</Badge>
                    </div>
                    <p className="mb-0" style={{ lineHeight: 1.65 }}>{selectedTicket.message}</p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Cập nhật trạng thái</label>
                    <select
                      className="form-select"
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  {selectedTicket.responses?.length ? (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Lịch sử phản hồi</label>
                      <div className="border rounded p-3" style={{ maxHeight: 180, overflowY: 'auto' }}>
                        {selectedTicket.responses.map((item) => (
                          <div key={item.id} className="mb-2 pb-2 border-bottom">
                            <div className="small text-muted">{item.adminEmail || 'system'} - {formatDate(item.createdAt)}</div>
                            <div>{item.response}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phản hồi tới người dùng</label>
                    <textarea
                      className="form-control"
                      rows={5}
                      placeholder="Nhập nội dung phản hồi cho người dùng..."
                      value={replyText}
                      onChange={(e) => { setReplyText(e.target.value); setReplyError('') }}
                    />
                  </div>

                  {replyError ? <div className="text-danger">{replyError}</div> : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeTicket}>Đóng</button>
                  <button type="button" className="btn btn-primary" onClick={handleSendReply}>Gửi phản hồi & đóng vé</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      ) : null}
    </div>
  )
}
