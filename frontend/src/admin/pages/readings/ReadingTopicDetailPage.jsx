import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard, Badge } from '../../components/console/AdminUi'

import { adminFetch } from '../../utils/api'

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

export function ReadingTopicDetailPage() {
  const { id } = useParams()
  const [topic, setTopic] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isDisposed = false
    async function loadData() {
      try {
        const response = await adminFetch(`/api/admin/reading-topics/${id}`)
        if (!response.ok) throw new Error(`Cannot fetch reading topic ${id}`)
        const payload = await response.json()
        if (!isDisposed) setTopic(payload)
      } catch (err) {
        if (!isDisposed) setError('Không thể tải thông tin chủ đề bài đọc.')
      } finally {
        if (!isDisposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { isDisposed = true }
  }, [id])

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>
  if (error) return <div className="alert alert-danger m-4">{error}</div>
  if (!topic) return <div className="alert alert-warning m-4">Không tìm thấy chủ đề bài đọc.</div>

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Reading Management"
          title={`Chi tiết chủ đề: ${topic.name}`}
          description="Thông tin quản trị chi tiết của chủ đề bài đọc."
          actions={
            <Link to="/admin/readings" className="btn btn-outline-secondary">Quay lại danh sách</Link>
          }
        />

        <div className="row mt-4">
          <div className="col-12 col-xl-8">
            <AdminSectionCard title="Thông số quản trị">
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <tbody>
                    <tr>
                      <th className="bg-light w-25">ID Chủ đề</th>
                      <td className="w-75"><code>{topic.id}</code></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Tên chủ đề</th>
                      <td className="fw-bold text-primary">{topic.name}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Mô tả</th>
                      <td>{topic.description || <span className="text-muted italic">Không có mô tả</span>}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Trạng thái</th>
                      <td>
                        <Badge tone={topic.status === 'Hoạt động' ? 'success' : 'warning'}>
                          {topic.status}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Số lượng bài báo</th>
                      <td>{topic.articleCount || 0} bài</td>
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
                      <td>{topic.deletedAt ? <span className="text-danger">{formatDate(topic.deletedAt)}</span> : <span className="text-muted">Chưa xóa</span>}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <Link to={`/admin/reading-topics/${topic.id}/edit`} className="btn btn-primary me-2">Chỉnh sửa</Link>
                <Link to={`/admin/reading-topics/${topic.id}/delete`} className="btn btn-danger">Xóa chủ đề</Link>
              </div>
            </AdminSectionCard>
          </div>

          <div className="col-12 col-xl-4">
            <AdminSectionCard title="Ảnh chủ đề">
              <div className="text-center">
                <img
                  src={topic.articleTopicImage || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={topic.name}
                  className="img-fluid rounded border shadow-sm w-100"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
