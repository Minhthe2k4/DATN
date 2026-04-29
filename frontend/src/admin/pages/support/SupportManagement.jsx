import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminSession } from '../../utils/adminSession'
import { supportTickets } from '../../data/adminData'
import {
  AdminPageHeader,
  AdminSectionCard,
  Badge,
  FilterTabs,
  SimpleTable,
  StatGrid,
  Pagination,
} from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'

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
  const navigate = useNavigate()
  const [tickets, setTickets] = useState(supportTickets)
  const [activeFilter, setActiveFilter] = useState('Tất cả')
  const [loadError, setLoadError] = useState('')
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

  useEffect(() => {
    async function handleNewNotification(event) {
      const notif = event.detail
      if (notif && (notif.type === 'NEW_SUPPORT_TICKET' || notif.type === 'USER_SUPPORT_REPLY')) {
        loadTickets(activeFilter).catch(() => {})
      }
    }

    window.addEventListener('new-notification', handleNewNotification)
    return () => window.removeEventListener('new-notification', handleNewNotification)
  }, [activeFilter])

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

  const pagination = usePagination(filteredTickets, 10)

  const openTicket = (ticket) => {
    navigate(`/admin/support/${ticket.id}`)
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
                  { key: 'email', label: 'Email' },
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
                rows={pagination.paginatedData}
              />
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.handlePageChange}
              />
            </AdminSectionCard>
          </div>
        </div>
      </div>

    </div>
  )
}
