import { useEffect, useMemo, useState } from 'react'
import { users } from '../../data/adminData'
import { AdminPageHeader } from '../../components/console/AdminUi'
import { Search } from 'lucide-react'
import { usePagination } from '../../hooks/usePagination'

import { 
  fetchUsers, 
  normalizeUserRow 
} from './utils/userUtils'

import { UserStats } from './components/UserStats'
import { UserDashboardCharts } from './components/UserDashboardCharts'
import { UserTable } from './components/UserTable'

export function UserManagement() {
  const [rows, setRows] = useState(users)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Tất cả')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let disposed = false
    async function loadData() {
      try {
        const payload = await fetchUsers()
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
    loadData()
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

  const newestUsers = useMemo(() => {
    return [...rows].sort((a, b) => new Date(b.rawCreatedAt || 0) - new Date(a.rawCreatedAt || 0)).slice(0, 5)
  }, [rows])

  const premiumData = useMemo(() => {
    const premiumCount = rows.filter(u => u.premium === 'Premium').length
    return [
      { name: 'Premium', count: premiumCount },
      { name: 'Free', count: rows.length - premiumCount }
    ]
  }, [rows])

  const statusData = useMemo(() => {
    const activeCount = rows.filter(u => u.isActive).length
    return [
      { name: 'Hoạt động', count: activeCount },
      { name: 'Bị khóa', count: rows.length - activeCount }
    ]
  }, [rows])

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="User Operations"
          title="Quản lý người dùng"
          description="Quản lý tài khoản người dùng, phân quyền và trạng thái hoạt động."
          actions={
            <div className="admin-topbar-search position-relative">
              <Search 
                size={16} 
                className="position-absolute" 
                style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
              />
              <input
                className="admin-input"
                style={{ paddingLeft: '36px' }}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm email, username..."
              />
            </div>
          }
        />

        <UserStats rows={rows} />

        {isLoading && <div className="alert alert-info mt-3">Đang tải dữ liệu người dùng...</div>}
        {loadError && <div className="alert alert-warning mt-3">{loadError}</div>}

        <UserDashboardCharts 
          newestUsers={newestUsers} 
          premiumData={premiumData} 
          statusData={statusData} 
        />

        <div className="row g-3 mt-3">
          <div className="col-12">
            <UserTable 
              pagination={pagination} 
              activeFilter={activeFilter} 
              setActiveFilter={setActiveFilter} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}