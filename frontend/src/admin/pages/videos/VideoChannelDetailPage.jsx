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

export function VideoChannelDetailPage() {
  const { id } = useParams()
  const [channel, setChannel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isDisposed = false
    async function loadData() {
      try {
        const response = await adminFetch(`/api/admin/video-channels/${id}`)
        if (!response.ok) throw new Error(`Cannot fetch channel ${id}`)
        const payload = await response.json()
        if (!isDisposed) setChannel(payload)
      } catch (err) {
        if (!isDisposed) setError('Không thể tải thông tin kênh YouTube.')
      } finally {
        if (!isDisposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { isDisposed = true }
  }, [id])

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>
  if (error) return <div className="alert alert-danger m-4">{error}</div>
  if (!channel) return <div className="alert alert-warning m-4">Không tìm thấy kênh.</div>

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="YouTube Channels"
          title={`Chi tiết kênh: ${channel.name}`}
          description="Thông tin chi tiết về kênh YouTube cung cấp nội dung học tập."
          actions={
            <Link to="/admin/videos" className="btn btn-outline-secondary">Quay lại danh sách</Link>
          }
        />

        <div className="row mt-4">
          <div className="col-12 col-xl-8">
            <AdminSectionCard title="Thông tin chi tiết">
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <tbody>
                    <tr>
                      <th className="bg-light w-25">ID</th>
                      <td className="w-75"><code>{channel.id}</code></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Tên kênh</th>
                      <td className="fw-bold text-primary">{channel.name}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Handle</th>
                      <td><Badge tone="info">{channel.handle || 'N/A'}</Badge></td>
                    </tr>
                    <tr>
                      <th className="bg-light">URL kênh</th>
                      <td>
                        {channel.url ? (
                          <a href={channel.url} target="_blank" rel="noreferrer" className="text-break">
                            {channel.url} <i className="iconoir-open-in-new ms-1"></i>
                          </a>
                        ) : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Số lượt đăng ký</th>
                      <td>{channel.subscriberCount ? channel.subscriberCount.toLocaleString() : '0'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Số video trong hệ thống</th>
                      <td>{channel.videoCount} video</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Trạng thái</th>
                      <td>
                        <Badge tone={channel.status === 'Hoạt động' ? 'success' : 'neutral'}>
                          {channel.status}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày tạo</th>
                      <td>{formatDate(channel.createdAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Cập nhật cuối</th>
                      <td>{formatDate(channel.updatedAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày xóa</th>
                      <td>{channel.deletedAt ? <span className="text-danger">{formatDate(channel.deletedAt)}</span> : <span className="text-muted">Chưa xóa</span>}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Mô tả</th>
                      <td>
                        <div className="p-2 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                          {channel.description || 'Không có mô tả.'}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <Link to={`/admin/video-channels/${channel.id}/edit`} className="btn btn-primary me-2">Chỉnh sửa</Link>
                <Link to={`/admin/video-channels/${channel.id}/delete`} className="btn btn-danger">Xóa kênh</Link>
              </div>
            </AdminSectionCard>
          </div>

          <div className="col-12 col-xl-4">
            <AdminSectionCard title="Ảnh đại diện">
              <div className="text-center p-3">
                <img
                  src={channel.avatar || 'https://via.placeholder.com/200?text=No+Avatar'}
                  alt={channel.name}
                  className="img-fluid rounded-circle border shadow-sm w-50"
                  style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                />
                <h5 className="mt-3 mb-0">{channel.name}</h5>
                <p className="text-muted">{channel.handle}</p>
              </div>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
