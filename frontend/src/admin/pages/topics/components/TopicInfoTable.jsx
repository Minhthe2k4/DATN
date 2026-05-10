import React from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/console/AdminUi'

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

export function TopicInfoTable({ topic }) {
  return (
    <>
      <div className="table-responsive">
        <table className="table table-bordered">
          <tbody>
            <tr>
              <th className="bg-light w-25">ID</th>
              <td>{topic.id}</td>
            </tr>
            <tr>
              <th className="bg-light">Tên chủ đề</th>
              <td className="fw-bold">{topic.name}</td>
            </tr>
            <tr>
              <th className="bg-light">Mô tả</th>
              <td style={{ whiteSpace: 'pre-wrap' }}>{topic.description || 'Không có mô tả'}</td>
            </tr>
            <tr>
              <th className="bg-light">Trạng thái</th>
              <td>
                <Badge tone={topic.status === 'Hoạt động' ? 'success' : 'warning'}>{topic.status}</Badge>
              </td>
            </tr>
            <tr>
              <th className="bg-light">Ngày tạo</th>
              <td>{formatDate(topic.createdAt)}</td>
            </tr>
            <tr>
              <th className="bg-light">Cập nhật cuối</th>
              <td>{formatDate(topic.updatedAt)}</td>
            </tr>
            <tr>
              <th className="bg-light">Ngày xóa</th>
              <td>{topic.deletedAt ? formatDate(topic.deletedAt) : 'Chưa xóa'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <Link to={`/admin/topics/${topic.id}/edit`} className="btn btn-primary me-2">Chỉnh sửa</Link>
        <Link to={`/admin/topics/${topic.id}/delete`} className="btn btn-danger">Xóa</Link>
      </div>
    </>
  )
}
