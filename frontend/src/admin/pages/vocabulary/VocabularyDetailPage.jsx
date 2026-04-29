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

export function VocabularyDetailPage() {
  const { id } = useParams()
  const [vocab, setVocab] = useState(null)
  const [lessons, setLessons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isDisposed = false
    async function loadData() {
      try {
        const [vocabRes, lessonsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/vocabulary/${id}`),
          fetch(`${API_BASE_URL}/api/admin/lessons`)
        ])

        if (!vocabRes.ok) throw new Error(`Cannot fetch vocabulary ${id}`)
        const vocabPayload = await vocabRes.json()
        const lessonsPayload = lessonsRes.ok ? await lessonsRes.json() : []

        if (!isDisposed) {
          setVocab(vocabPayload)
          setLessons(lessonsPayload)
        }
      } catch (err) {
        if (!isDisposed) setError('Không thể tải thông tin từ vựng.')
      } finally {
        if (!isDisposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { isDisposed = true }
  }, [id])

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>
  if (error) return <div className="alert alert-danger m-4">{error}</div>
  if (!vocab) return <div className="alert alert-warning m-4">Không tìm thấy từ vựng.</div>

  const lessonName = Array.isArray(lessons)
    ? lessons.find(l => String(l.id) === String(vocab.lessonId))?.name || 'Chưa gán bài học'
    : 'Chưa gán bài học'

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Vocabulary Detail"
          title={`Từ vựng: ${vocab.word}`}
          description="Toàn bộ thông tin chi tiết của từ vựng trong hệ thống."
          actions={
            <Link to="/admin/vocabulary" className="btn btn-outline-secondary">Quay lại danh sách</Link>
          }
        />

        <div className="row mt-4">
          <div className="col-12">
            <AdminSectionCard title="Thông tin chi tiết tập trung">
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <tbody>
                    <tr>
                      <th className="bg-light w-25">ID</th>
                      <td className="w-75"><code>{vocab.id}</code></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Từ vựng</th>
                      <td className="fw-bold fs-5 text-primary">{vocab.word}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Phiên âm</th>
                      <td>{vocab.pronunciation || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Từ loại</th>
                      <td><span className="badge bg-soft-info text-info fs-6">{vocab.typeOfWord}</span></td>
                    </tr>
                    <tr>
                      <th className="bg-light">Mức độ</th>
                      <td>{vocab.level}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Bài học</th>
                      <td>{lessonName}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Trạng thái</th>
                      <td>
                        <Badge tone={vocab.status === 'Đã duyệt' ? 'success' : 'warning'}>{vocab.status}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Nghĩa tiếng Anh</th>
                      <td style={{ whiteSpace: 'pre-wrap' }}>{vocab.meaningEn || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Nghĩa tiếng Việt</th>
                      <td className="text-success fw-medium" style={{ whiteSpace: 'pre-wrap' }}>{vocab.meaningVi || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ví dụ tiếng Anh</th>
                      <td className="fst-italic">"{vocab.example || 'N/A'}"</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ví dụ tiếng Việt</th>
                      <td>"{vocab.exampleVi || 'N/A'}"</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày tạo</th>
                      <td>{formatDate(vocab.createdAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Cập nhật cuối</th>
                      <td>{formatDate(vocab.updatedAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày xóa</th>
                      <td>{vocab.deletedAt ? <span className="text-danger">{formatDate(vocab.deletedAt)}</span> : <span className="text-muted">Chưa xóa</span>}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <Link to={`/admin/vocabulary/${vocab.id}/edit`} className="btn btn-primary me-2">Chỉnh sửa</Link>
                <Link to={`/admin/vocabulary/${vocab.id}/delete`} className="btn btn-danger">Xóa từ vựng</Link>
              </div>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
