import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard, Badge } from '../../components/console/AdminUi'

import { adminFetch } from '../../utils/api'

import { UserInfoTable } from './components/UserInfoTable'
import { UserAvatarCard } from './components/UserAvatarCard'

export function UserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const response = await adminFetch(`/api/admin/users/${id}`)
        if (!response.ok) throw new Error(`Cannot fetch user ${id}`)
        const payload = await response.json()
        setUser(payload)
      } catch (err) {
        setError('Không thể tải thông tin người dùng.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  if (isLoading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>
  if (error) return <div className="alert alert-danger m-4">{error}</div>
  if (!user) return <div className="alert alert-warning m-4">Không tìm thấy người dùng.</div>

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="User Management"
          title={`Chi tiết người dùng: ${user.username}`}
          description="Thông tin cá nhân, vai trò và trạng thái hoạt động của tài khoản."
          actions={
            <Link to="/admin/users" className="btn btn-outline-secondary">Quay lại danh sách</Link>
          }
        />

        <div className="row mt-4">
          <div className="col-12 col-xl-8">
            <AdminSectionCard title="Thông tin cá nhân">
              <UserInfoTable user={user} />
            </AdminSectionCard>
          </div>

          <div className="col-12 col-xl-4">
            <AdminSectionCard title="Ảnh đại diện">
              <UserAvatarCard user={user} />
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
