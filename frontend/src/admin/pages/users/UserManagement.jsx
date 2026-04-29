import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { users } from '../../data/adminData'
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

function formatDate(value) {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '---'
  return date.toLocaleDateString('vi-VN')
}

function normalizeUserRow(row) {
  return {
    id: row.id,
    username: row.username ?? '',
    email: row.email ?? '',
    fullname: row.fullname ?? '',
    role: row.role ?? 'USER',
    createdAt: formatDate(row.createdAt),
    status: row.status ?? (row.isActive ? 'Hoạt động' : 'Bị khóa'),
    isActive: Boolean(row.isActive),
    premium: row.premium ? 'Premium' : 'Thường',
    avatar: row.avatar ?? '',
  }
}

export function UserManagement() {
  const [rows, setRows] = useState(users)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Tất cả')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let disposed = false
    async function loadUsers() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`)
        if (!response.ok) throw new Error('Cannot fetch users')
        const payload = await response.json()
        if (disposed) return
        setRows(Array.isArray(payload) ? payload.map(normalizeUserRow) : users)
        setLoadError('')
      } catch {
        if (disposed) return
        setRows(users)
        setLoadError('Không thể tải dữ liệu từ backend.')
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }
    loadUsers()
    return () => { disposed = true }
  }, [])

  const filteredUsers = useMemo(() => {
    return rows.filter((user) => {
      const normalizedQuery = query.toLowerCase()
      const matchesQuery = user.email.toLowerCase().includes(normalizedQuery)
        || user.username.toLowerCase().includes(normalizedQuery)
        || user.fullname.toLowerCase().includes(normalizedQuery)
      const matchesFilter = activeFilter === 'Tất cả' || user.status === activeFilter
      return matchesQuery && matchesFilter
    })
  }, [activeFilter, query, rows])

  const pagination = usePagination(filteredUsers, 10)

  const stats = [
    { label: 'Tổng số tài khoản', value: rows.length.toString(), meta: 'Toàn bộ hệ thống', icon: 'iconoir-community' },
    { label: 'Đang hoạt động', value: rows.filter((user) => user.isActive).length.toString(), meta: 'Có thể đăng nhập', icon: 'iconoir-check-circle' },
    { label: 'Bị khóa', value: rows.filter((user) => !user.isActive).length.toString(), meta: 'Tài khoản tạm ngừng', icon: 'iconoir-lock' },
    { label: 'Premium', value: rows.filter((user) => user.premium === 'Premium').length.toString(), meta: 'Gói nâng cao', icon: 'iconoir-star' },
  ]

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="User Operations"
          title="Quản lý người dùng"
          description="Quản lý tài khoản người dùng, phân quyền và trạng thái hoạt động."
          actions={
            <div className="admin-topbar-search">
              <input
                className="admin-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm email, username..."
              />
            </div>
          }
        />

        <StatGrid items={stats} />

        {isLoading && <div className="alert alert-info mt-3">Đang tải dữ liệu người dùng...</div>}
        {loadError && <div className="alert alert-warning mt-3">{loadError}</div>}

        <div className="row g-3 mt-1">
          <div className="col-12">
            <AdminSectionCard
              title="Danh sách người dùng"
              description="Tra cứu và xử lý tài khoản theo trạng thái hoạt động."
              actions={<FilterTabs items={['Tất cả', 'Hoạt động', 'Bị khóa']} active={activeFilter} onChange={setActiveFilter} />}
            >
              <SimpleTable
                columns={[
                  { 
                    key: 'avatar', 
                    label: 'Ảnh',
                    render: (row) => (
                      <img 
                        src={row.avatar || 'https://via.placeholder.com/32'} 
                        alt="Avatar" 
                        className="rounded-circle border" 
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }} 
                      />
                    )
                  },
                  { key: 'username', label: 'Username' },
                  { key: 'email', label: 'Email' },
                  { key: 'fullname', label: 'Họ tên' },
                  { key: 'createdAt', label: 'Ngày tạo' },
                  {
                    key: 'role',
                    label: 'Vai trò',
                    render: (row) => <Badge tone={row.role === 'ADMIN' ? 'danger' : 'info'}>{row.role}</Badge>,
                  },
                  {
                    key: 'status',
                    label: 'Trạng thái',
                    render: (row) => <Badge tone={row.isActive ? 'success' : 'danger'}>{row.status}</Badge>,
                  },
                  {
                    key: 'actions',
                    label: 'Hành động',
                    render: (row) => (
                      <div className="d-flex flex-nowrap gap-2">
                        <Link to={`/admin/users/${row.id}`} className="btn btn-sm btn-soft-info">Chi tiết</Link>
                        <Link to={`/admin/users/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                        <Link to={`/admin/users/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
                      </div>
                    ),
                  },
                ]}
                rows={pagination.paginatedData}
                emptyMessage="Không tìm thấy người dùng phù hợp."
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