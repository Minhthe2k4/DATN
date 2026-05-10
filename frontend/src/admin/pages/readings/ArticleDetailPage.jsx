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

export function ArticleDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isDisposed = false
    async function loadData() {
      try {
        const response = await adminFetch(`/api/admin/readings/${id}`)
        if (!response.ok) throw new Error(`Cannot fetch article ${id}`)
        const payload = await response.json()
        if (!isDisposed) setArticle(payload)
      } catch (err) {
        if (!isDisposed) setError('Không thể tải thông tin bài đọc.')
      } finally {
        if (!isDisposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { isDisposed = true }
  }, [id])

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>
  if (error) return <div className="alert alert-danger m-4">{error}</div>
  if (!article) return <div className="alert alert-warning m-4">Không tìm thấy bài đọc.</div>

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Reading Management"
          title={`Chi tiết bài đọc: ${article.title}`}
          description="Toàn bộ thông tin chi tiết của bài đọc trong hệ thống."
          actions={
            <Link to="/admin/readings" className="btn btn-outline-secondary">Quay lại danh sách</Link>
          }
        />

        <div className="row mt-4">
          <div className="col-12 col-xl-8">
            <AdminSectionCard title="Thông tin chi tiết tập trung">
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <tbody>
                    <tr>
                      <th className="bg-light w-25">ID</th>
                      <td className="w-75"><code>{article.id}</code></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Tiêu đề</th>
                      <td className="fw-bold text-primary">{article.title}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Chủ đề</th>
                      <td>{article.topic || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Độ khó</th>
                      <td><Badge tone="neutral">{article.difficulty}</Badge></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Trạng thái</th>
                      <td>
                        <Badge tone={article.status === 'Đã xuất bản' ? 'success' : article.status === 'Chờ biên tập' ? 'warning' : 'neutral'}>
                          {article.status}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Từ nổi bật</th>
                      <td>{article.wordsHighlighted} từ</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Nguồn (URL)</th>
                      <td>{article.sourceUrl ? <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="text-break">{article.sourceUrl}</a> : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày tạo</th>
                      <td>{formatDate(article.createdAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Cập nhật cuối</th>
                      <td>{formatDate(article.updatedAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày xóa</th>
                      <td>{article.deletedAt ? <span className="text-danger">{formatDate(article.deletedAt)}</span> : <span className="text-muted">Chưa xóa</span>}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Nội dung</th>
                      <td>
                        <div 
                          className="article-content-preview p-3 bg-light rounded border" 
                          style={{ maxHeight: '400px', overflowY: 'auto' }}
                          dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <Link to={`/admin/readings/${article.id}/edit`} className="btn btn-primary me-2">Chỉnh sửa</Link>
                <Link to={`/admin/readings/${article.id}/delete`} className="btn btn-danger">Xóa bài đọc</Link>
              </div>
            </AdminSectionCard>
          </div>

          <div className="col-12 col-xl-4">
            <AdminSectionCard title="Ảnh minh họa">
              <div className="text-center">
                <img
                  src={article.articleImage || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={article.title}
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
