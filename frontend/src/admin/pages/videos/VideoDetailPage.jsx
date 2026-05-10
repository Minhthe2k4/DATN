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

export function VideoDetailPage() {
  const { id } = useParams()
  const [video, setVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isDisposed = false
    async function loadData() {
      try {
        const response = await adminFetch(`/api/admin/videos/${id}`)
        if (!response.ok) throw new Error(`Cannot fetch video ${id}`)
        const payload = await response.json()
        if (!isDisposed) setVideo(payload)
      } catch (err) {
        if (!isDisposed) setError('Không thể tải thông tin video.')
      } finally {
        if (!isDisposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { isDisposed = true }
  }, [id])

  if (isLoading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>
  if (error) return <div className="alert alert-danger m-4">{error}</div>
  if (!video) return <div className="alert alert-warning m-4">Không tìm thấy video.</div>

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Video Management"
          title={`Chi tiết video: ${video.title}`}
          description="Thông tin chi tiết về video, phụ đề và các thông số kỹ thuật."
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
                      <td className="w-75"><code>{video.id}</code></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Tiêu đề</th>
                      <td className="fw-bold text-primary">{video.title}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Kênh sở hữu</th>
                      <td>{video.channelName || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Độ khó</th>
                      <td><Badge tone="neutral">{video.difficulty}</Badge></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Thời lượng</th>
                      <td>{video.duration}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Trạng thái bài học</th>
                      <td>
                        <Badge tone={video.status === 'Đã xuất bản' ? 'success' : video.status === 'Chờ biên tập' ? 'warning' : 'neutral'}>
                          {video.status}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Trạng thái phụ đề</th>
                      <td>
                        <Badge tone={video.subtitleStatus === 'DONE' ? 'success' : video.subtitleStatus === 'ERROR' ? 'danger' : 'info'}>
                          {video.subtitleStatus}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">YouTube URL</th>
                      <td>
                        {video.youtubeUrl ? (
                          <a href={video.youtubeUrl} target="_blank" rel="noreferrer" className="text-break">
                            {video.youtubeUrl} <i className="iconoir-open-in-new ms-1"></i>
                          </a>
                        ) : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">File Path (Cloudinary/Storage)</th>
                      <td><code className="text-break">{video.filePath || 'Chưa có file'}</code></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Từ nổi bật</th>
                      <td>{video.wordsHighlighted} từ</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày tạo</th>
                      <td>{formatDate(video.createdAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Cập nhật cuối</th>
                      <td>{formatDate(video.updatedAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày xóa</th>
                      <td>{video.deletedAt ? <span className="text-danger">{formatDate(video.deletedAt)}</span> : <span className="text-muted">Chưa xóa</span>}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <Link to={`/admin/videos/${video.id}/edit`} className="btn btn-primary me-2 px-4">Chỉnh sửa</Link>
                <Link to={`/admin/videos/${video.id}/delete`} className="btn btn-danger px-4">Xóa video</Link>
              </div>
            </AdminSectionCard>
          </div>

          <div className="col-12 col-xl-4">
            <AdminSectionCard title="Thumbnail & Media">
              <div className="text-center mb-4">
                <img
                  src={video.thumbnail || 'https://via.placeholder.com/400x225?text=No+Thumbnail'}
                  alt={video.title}
                  className="img-fluid rounded border shadow-sm w-100"
                  style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                />
              </div>
              
              <div className="mt-2">
                <h6 className="fw-bold mb-2">Transcript Preview:</h6>
                <div 
                  className="p-3 bg-light rounded border text-muted" 
                  style={{ maxHeight: '300px', overflowY: 'auto', fontSize: '0.9rem', lineHeight: '1.5' }}
                >
                  {video.transcript || 'Không có dữ liệu transcript.'}
                </div>
              </div>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
