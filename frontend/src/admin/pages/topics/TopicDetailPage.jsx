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

export function TopicDetailPage() {
  const { id } = useParams()
  const [topic, setTopic] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isDisposed = false
    async function loadTopic() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/topics/${id}`)
        if (!response.ok) throw new Error(`Cannot fetch topic ${id}`)
        const payload = await response.json()
        if (!isDisposed) setTopic(payload)
      } catch (err) {
        if (!isDisposed) setError('Không thể tải thông tin chủ đề.')
      } finally {
        if (!isDisposed) setIsLoading(false)
      }
    }
    loadTopic()
    return () => { isDisposed = true }
  }, [id])

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>
  if (error) return <div className="alert alert-danger m-4">{error}</div>
  if (!topic) return <div className="alert alert-warning m-4">Không tìm thấy chủ đề.</div>

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Topic Management"
          title={`Chi tiết chủ đề: ${topic.name}`}
          description="Xem chi tiết thông tin tất cả các trường trong hệ thống."
          actions={<Link to="/admin/topics" className="btn btn-outline-secondary">Quay lại danh sách</Link>}
        />

        <div className="row mt-4">
          <div className="col-12 col-xl-8">
            <AdminSectionCard title="Thông tin cơ bản">
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
            </AdminSectionCard>
          </div>
          <div className="col-12 col-xl-4">
            <AdminSectionCard title="Ảnh chủ đề">
              <div className="text-center">
                <img
                  src={topic.topicImage || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={topic.name}
                  className="img-fluid rounded border shadow-sm"
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
