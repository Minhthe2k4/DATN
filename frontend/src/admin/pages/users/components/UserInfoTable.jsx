import React from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/console/AdminUi'

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

export function UserInfoTable({ user }) {
  return (
    <>
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
    </>
  )
}
