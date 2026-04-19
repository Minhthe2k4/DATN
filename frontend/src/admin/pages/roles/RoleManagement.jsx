import { useEffect, useMemo, useState } from 'react'
import { roleDefinitions } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, Badge, SimpleTable, StatGrid } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function RoleManagement() {
  const [roleStats, setRoleStats] = useState([
    { role: 'ADMIN', count: 0 },
    { role: 'USER', count: 0 },
  ])
  const [roleUsers, setRoleUsers] = useState([])
  const [loadError, setLoadError] = useState('')

  const loadData = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/roles/overview`)
    if (!response.ok) {
      throw new Error('Cannot fetch role overview')
    }

    const payload = await response.json()
    setRoleStats(Array.isArray(payload?.stats) ? payload.stats : [])
    setRoleUsers(Array.isArray(payload?.users) ? payload.users : [])
  }

  useEffect(() => {
    loadData().catch(() => setLoadError('Không thể tải dữ liệu phân quyền từ backend.'))
  }, [])

  const handleChangeRole = async (row, role) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/roles/users/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error('Cannot update role')
      }

      setLoadError('')
      await loadData()
    } catch {
      setLoadError('Không thể cập nhật role cho người dùng này.')
    }
  }

  const adminCount = useMemo(() => roleStats.find((item) => item.role === 'ADMIN')?.count ?? 0, [roleStats])
  const userCount = useMemo(() => roleStats.find((item) => item.role === 'USER')?.count ?? 0, [roleStats])

  const stats = [
    {
      label: 'Số vai trò hệ thống',
      value: '2',
      meta: 'Hiện tại gồm USER và ADMIN',
      icon: 'iconoir-shield-check',
    },
    {
      label: 'Admin toàn quyền',
      value: adminCount.toString(),
      meta: 'Có quyền truy cập và chỉnh sửa toàn bộ dữ liệu',
      icon: 'iconoir-crown',
    },
    {
      label: 'Phạm vi người dùng',
      value: userCount.toString(),
      meta: 'Chỉ thao tác trên dữ liệu học tập của bản thân',
      icon: 'iconoir-user',
    },
    {
      label: 'Điểm kiểm soát',
      value: '4',
      meta: 'Nội dung, người dùng, báo cáo, SRS',
      icon: 'iconoir-lock',
    },
  ]

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Access Control"
          title="Phân quyền hệ thống"
          description="Chuẩn hóa phạm vi truy cập theo vai trò để đảm bảo an toàn dữ liệu và trách nhiệm thao tác."
          actions={<button type="button" className="btn btn-primary">Xem nhật ký phân quyền</button>}
        />

        <StatGrid items={stats} />
        {loadError ? <div className="alert alert-warning mt-3 mb-0">{loadError}</div> : null}

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-5">
            <AdminSectionCard title="Định nghĩa vai trò" description="Phạm vi quyền của các nhóm tài khoản trong hệ thống.">
              <div className="admin-role-grid">
                {roleDefinitions.map((item) => (
                  <div key={item.role} className="admin-role-card">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="admin-role-card__title">{item.role}</div>
                      <Badge tone={item.role === 'ADMIN' ? 'danger' : 'info'}>{item.role === 'ADMIN' ? 'Toàn quyền' : 'Chuẩn'}</Badge>
                    </div>
                    <div className="admin-role-card__scope">{item.scope}</div>
                    <div className="small">{item.permissions.join(' • ')}</div>
                  </div>
                ))}
              </div>
            </AdminSectionCard>
          </div>

          <div className="col-12 col-xl-7">
            <AdminSectionCard title="Người dùng theo vai trò" description="Thay đổi quyền USER/ADMIN trực tiếp cho từng tài khoản.">
              <SimpleTable
                columns={[
                  { key: 'username', label: 'Username' },
                  { key: 'email', label: 'Email' },
                  {
                    key: 'role',
                    label: 'Vai trò',
                    render: (row) => <Badge tone={row.role === 'ADMIN' ? 'danger' : 'info'}>{row.role}</Badge>,
                  },
                  {
                    key: 'status',
                    label: 'Trạng thái',
                    render: (row) => <Badge tone={row.active ? 'success' : 'neutral'}>{row.active ? 'Hoạt động' : 'Bị khóa'}</Badge>,
                  },
                  {
                    key: 'actions',
                    label: 'Hành động',
                    render: (row) => (
                      <div className="d-flex flex-wrap gap-2">
                        <button type="button" className="btn btn-sm btn-soft-primary" onClick={() => handleChangeRole(row, 'USER')}>
                          Đặt USER
                        </button>
                        <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleChangeRole(row, 'ADMIN')}>
                          Đặt ADMIN
                        </button>
                      </div>
                    ),
                  },
                ]}
                rows={roleUsers}
              />
            </AdminSectionCard>
          </div>
        </div>

      </div>
    </div>
  )
}