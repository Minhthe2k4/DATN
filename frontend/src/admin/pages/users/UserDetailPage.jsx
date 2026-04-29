import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard, Badge } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function formatDate(dateString) {
  if (!dateString) return 'Chưa có'
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function UserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`)
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
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <tbody>
                    <tr>
                      <th className="bg-light w-25">ID</th>
                      <td className="w-75"><code>{user.id}</code></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Username</th>
                      <td className="fw-bold">{user.username}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Email</th>
                      <td>{user.email}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Họ và tên</th>
                      <td>{user.fullname || 'Chưa cập nhật'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Số điện thoại</th>
                      <td>{user.phoneNumber || 'Chưa cập nhật'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Vai trò</th>
                      <td><Badge tone={user.role === 'ADMIN' ? 'danger' : 'info'}>{user.role}</Badge></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Trạng thái</th>
                      <td>
                        <Badge tone={user.isActive ? 'success' : 'danger'}>
                          {user.status || (user.isActive ? 'Hoạt động' : 'Bị khóa')}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Gói dịch vụ</th>
                      <td>
                        <Badge tone={user.premium ? 'info' : 'neutral'}>
                          {user.premium ? 'Premium' : 'Thường'}
                        </Badge>
                        {user.premium && user.premiumUntil && (
                          <span className="ms-2 text-muted small">Hạn dùng: {formatDate(user.premiumUntil)}</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày tạo tài khoản</th>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Cập nhật cuối</th>
                      <td>{formatDate(user.updatedAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày xóa (nếu có)</th>
                      <td>{user.deletedAt ? <span className="text-danger">{formatDate(user.deletedAt)}</span> : <span className="text-muted">Chưa xóa</span>}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <Link to={`/admin/users/${user.id}/edit`} className="btn btn-primary me-2 px-4">Chỉnh sửa</Link>
                <Link to={`/admin/users/${user.id}/delete`} className="btn btn-danger px-4">Xóa tài khoản</Link>
              </div>
            </AdminSectionCard>
          </div>

          <div className="col-12 col-xl-4">
            <AdminSectionCard title="Ảnh đại diện">
              <div className="text-center p-3">
                <img
                  src={user.avatar || 'https://via.placeholder.com/200?text=No+Avatar'}
                  alt={user.username}
                  className="img-fluid rounded-circle border shadow-sm w-50"
                  style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                />
                <h5 className="mt-3 mb-0">{user.fullname || user.username}</h5>
                <p className="text-muted">{user.email}</p>
              </div>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
