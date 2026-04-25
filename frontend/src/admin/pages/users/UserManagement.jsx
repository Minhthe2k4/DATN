import { useEffect, useMemo, useState } from 'react'
import { users } from '../../data/adminData'
import {
  AdminPageHeader,
  AdminSectionCard,
  Badge,
  FilterTabs,
  SimpleTable,
  StatGrid,
} from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function formatDate(value) {
  if (!value) {
    return '---'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '---'
  }

  return date.toLocaleDateString('vi-VN')
}

function formatActivity(value) {
  if (!value) {
    return 'Chưa có dữ liệu'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Chưa có dữ liệu'
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60)))
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} giờ trước`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ngày trước`
}

function normalizeUserRow(row) {
  const statusLabel = row.status ?? (row.active ? 'Hoạt động' : 'Bị khóa')
  return {
    id: row.id,
    username: row.username ?? '',
    email: row.email ?? '',
    fullName: row.fullName ?? '',
    role: row.role ?? 'USER',
    registeredAt: formatDate(row.registeredAt),
    learnedWords: row.learnedWords ?? 0,
    dailyLogin: formatActivity(row.lastActivityAt),
    premium: row.premium ? 'Premium' : 'Thường',
    status: statusLabel,
    active: Boolean(row.active),
  }
}

function emptyDraft() {
  return {
    username: '',
    email: '',
    fullName: '',
    role: 'USER',
  }
}

export function UserManagement() {
  const [rows, setRows] = useState(users)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Tất cả')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [detailUser, setDetailUser] = useState(null)
  const [draft, setDraft] = useState(emptyDraft())

  useEffect(() => {
    let disposed = false

    async function loadUsers() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`)
        if (!response.ok) {
          throw new Error('Cannot fetch users')
        }

        const payload = await response.json()
        if (disposed) {
          return
        }

        setRows(Array.isArray(payload) ? payload.map(normalizeUserRow) : users)
        setLoadError('')
      } catch {
        if (disposed) {
          return
        }
        setRows(users)
        setLoadError('Không thể tải dữ liệu từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!disposed) {
          setIsLoading(false)
        }
      }
    }

    loadUsers()
    return () => {
      disposed = true
    }
  }, [])

  const reloadUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`)
    if (!response.ok) {
      throw new Error('Cannot reload users')
    }
    const payload = await response.json()
    setRows(Array.isArray(payload) ? payload.map(normalizeUserRow) : users)
  }

  const openEditModal = (user) => {
    setEditingId(user.id)
    setDraft({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role || 'USER',
    })
    setActionError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setEditingId(null)
    setDraft(emptyDraft())
    setIsModalOpen(false)
  }

  const openDetailModal = async (user) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}`)
      if (response.ok) {
        const fullUser = await response.json()
        setDetailUser(fullUser)
        setIsDetailModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  const closeDetailModal = () => {
    setDetailUser(null)
    setIsDetailModalOpen(false)
  }

  const setDraftField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!editingId) {
      return
    }

    if (!draft.username.trim() || !draft.email.trim()) {
      setActionError('Username và email là bắt buộc.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: draft.username.trim(),
          email: draft.email.trim(),
          fullName: draft.fullName.trim(),
          role: draft.role,
        }),
      })

      if (!response.ok) {
        throw new Error('Cannot update user')
      }

      await reloadUsers()
      setActionError('')
      closeModal()
    } catch {
      setActionError('Không thể cập nhật người dùng. Vui lòng thử lại.')
    }
  }

  const handleToggleActivation = async (user) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/activation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      })

      if (!response.ok) {
        throw new Error('Cannot update activation')
      }

      await reloadUsers()
      setActionError('')
    } catch {
      setActionError('Không thể cập nhật trạng thái khóa/mở tài khoản.')
    }
  }

  const handleSoftDelete = async (user) => {
    const confirmed = window.confirm(`Xóa mềm tài khoản ${user.email}? Tài khoản sẽ ẩn khỏi danh sách người dùng.`)
    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok && response.status !== 204) {
        throw new Error('Cannot soft delete user')
      }

      await reloadUsers()
      setActionError('')
    } catch {
      setActionError('Không thể xóa mềm tài khoản này.')
    }
  }

  const filteredUsers = useMemo(() => {
    return rows.filter((user) => {
      const normalizedQuery = query.toLowerCase()
      const matchesQuery = user.email.toLowerCase().includes(normalizedQuery)
        || user.username.toLowerCase().includes(normalizedQuery)
        || user.fullName.toLowerCase().includes(normalizedQuery)
      const matchesFilter = activeFilter === 'Tất cả' || user.status === activeFilter
      return matchesQuery && matchesFilter
    })
  }, [activeFilter, query, rows])

  const stats = [
    {
      label: 'Tổng số tài khoản',
      value: rows.length.toString(),
      meta: 'Số tài khoản đang hiển thị (đã loại trừ tài khoản xóa mềm)',
      icon: 'iconoir-community',
    },
    {
      label: 'Đang hoạt động',
      value: rows.filter((user) => user.status === 'Hoạt động').length.toString(),
      meta: 'Có thể truy cập hệ thống bình thường',
      icon: 'iconoir-check-circle',
    },
    {
      label: 'Bị khóa',
      value: rows.filter((user) => user.status === 'Bị khóa').length.toString(),
      meta: 'Không được phép tiếp tục đăng nhập',
      icon: 'iconoir-lock',
    },
    {
      label: 'Premium',
      value: rows.filter((user) => user.premium === 'Premium').length.toString(),
      meta: 'Nhóm người dùng trả phí đang hoạt động',
      icon: 'iconoir-star',
    },
  ]

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="User Operations"
          title="Quản lý người dùng"
          description="Sửa thông tin người dùng, khóa/mở tài khoản và xóa mềm tài khoản khỏi hệ thống quản trị."
          actions={
            <div className="admin-topbar-search">
              <input
                className="admin-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo email, username hoặc tên hiển thị"
              />
            </div>
          }
        />

        <StatGrid items={stats} />

        {isLoading ? <div className="alert alert-info mt-3 mb-0">Đang tải dữ liệu người dùng...</div> : null}
        {loadError ? <div className="alert alert-warning mt-3 mb-0">{loadError}</div> : null}
        {actionError ? <div className="alert alert-danger mt-3 mb-0">{actionError}</div> : null}

        <div className="row g-3 mt-1">
          <div className="col-12">
            <AdminSectionCard
              title="Danh sách người dùng"
              description="Tra cứu và xử lý tài khoản theo trạng thái hoạt động, xác minh và gói dịch vụ."
              actions={<FilterTabs items={['Tất cả', 'Hoạt động', 'Bị khóa', 'Chờ xác minh']} active={activeFilter} onChange={setActiveFilter} />}
            >
              <SimpleTable
                columns={[
                  { key: 'email', label: 'Email' },
                  { key: 'registeredAt', label: 'Ngày đăng ký' },
                  { key: 'learnedWords', label: 'Số từ đã học' },
                  { key: 'dailyLogin', label: 'Hoạt động gần đây' },
                  {
                    key: 'role',
                    label: 'Vai trò',
                    render: (row) => <Badge tone={row.role === 'ADMIN' ? 'danger' : 'info'}>{row.role}</Badge>,
                  },
                  {
                    key: 'premium',
                    label: 'Gói',
                    render: (row) => <Badge tone={row.premium === 'Premium' ? 'info' : 'neutral'}>{row.premium}</Badge>,
                  },
                  {
                    key: 'status',
                    label: 'Trạng thái',
                    render: (row) => {
                      const tone = row.status === 'Hoạt động' ? 'success' : row.status === 'Bị khóa' ? 'danger' : 'warning'
                      return <Badge tone={tone}>{row.status}</Badge>
                    },
                  },
                  {
                    key: 'actions',
                    label: 'Hành động',
                    render: (row) => (
                      <div className="d-flex flex-wrap gap-2">
                        <button type="button" className="btn btn-sm btn-soft-info" onClick={() => openDetailModal(row)}>Chi tiết</button>
                        <button type="button" className="btn btn-sm btn-soft-primary" onClick={() => openEditModal(row)}>Sửa</button>
                        <button
                          type="button"
                          className={`btn btn-sm ${row.active ? 'btn-soft-warning' : 'btn-soft-success'}`}
                          onClick={() => handleToggleActivation(row)}
                        >
                          {row.active ? 'Khóa' : 'Mở'}
                        </button>
                        <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleSoftDelete(row)}>Xóa mềm</button>
                      </div>
                    ),
                  },
                ]}
                rows={filteredUsers}
                emptyMessage="Không tìm thấy người dùng phù hợp bộ lọc hiện tại."
              />
            </AdminSectionCard>
          </div>
        </div>

        {isModalOpen ? (
          <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(19, 26, 44, 0.45)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Sửa thông tin người dùng</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={draft.username}
                      onChange={(event) => setDraftField('username', event.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={draft.email}
                      onChange={(event) => setDraftField('email', event.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tên hiển thị</label>
                    <input
                      type="text"
                      className="form-control"
                      value={draft.fullName}
                      onChange={(event) => setDraftField('fullName', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Vai trò</label>
                    <select className="form-select" value={draft.role} onChange={(event) => setDraftField('role', event.target.value)}>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Hủy</button>
                  <button type="button" className="btn btn-primary" onClick={handleSave}>Lưu thay đổi</button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isDetailModalOpen && detailUser ? (
          <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(19, 26, 44, 0.45)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chi tiết người dùng: {detailUser.username}</h5>
                  <button type="button" className="btn-close" onClick={closeDetailModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-4 text-center mb-3">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                        {detailUser.fullName?.charAt(0) || detailUser.username?.charAt(0) || 'U'}
                      </div>
                      <h4 className="mt-3">{detailUser.fullName || '---'}</h4>
                      <Badge tone={detailUser.role === 'ADMIN' ? 'danger' : 'info'}>{detailUser.role}</Badge>
                    </div>
                    <div className="col-md-8">
                      <div className="row g-3">
                        <div className="col-6">
                          <label className="text-muted small d-block">ID người dùng</label>
                          <strong>#{detailUser.id}</strong>
                        </div>
                        <div className="col-6">
                          <label className="text-muted small d-block">Email</label>
                          <strong>{detailUser.email}</strong>
                        </div>
                        <div className="col-6">
                          <label className="text-muted small d-block">Ngày đăng ký</label>
                          <strong>{formatDate(detailUser.registeredAt)}</strong>
                        </div>
                        <div className="col-6">
                          <label className="text-muted small d-block">Trạng thái</label>
                          <strong>{detailUser.active ? 'Đang hoạt động' : 'Bị khóa'}</strong>
                        </div>
                        <div className="col-6">
                          <label className="text-muted small d-block">Gói dịch vụ</label>
                          <strong>{detailUser.premium ? 'Premium' : 'Thường'}</strong>
                        </div>
                        {detailUser.premium && (
                          <div className="col-6">
                            <label className="text-muted small d-block">Hạn dùng Premium</label>
                            <strong>{formatDate(detailUser.premiumUntil)}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <h6 className="mb-3">Thống kê học tập</h6>
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="p-3 bg-light rounded">
                        <div className="h4 mb-0">{detailUser.learnedWords}</div>
                        <div className="small text-muted">Từ đã học</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 bg-light rounded">
                        <div className="h4 mb-0">{formatActivity(detailUser.lastActivityAt)}</div>
                        <div className="small text-muted">Hoạt động cuối</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 bg-light rounded">
                        <div className="h4 mb-0">{detailUser.active ? 'Online' : 'Offline'}</div>
                        <div className="small text-muted">Trạng thái hiện tại</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeDetailModal}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}