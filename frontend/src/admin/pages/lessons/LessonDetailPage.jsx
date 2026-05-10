import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard, Badge } from '../../components/console/AdminUi'
import { 
  Star, 
  Edit, 
  Trash2, 
  ArrowLeft 
} from 'lucide-react'

import { adminFetch } from '../../utils/api'
import { formatDateTime } from './utils/lessonUtils'


export function LessonDetailPage() {
  const { id } = useParams()
  const [lesson, setLesson] = useState(null)
  const [topic, setTopic] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isDisposed = false
    async function loadData() {
      try {
        const lessonRes = await adminFetch(`/api/admin/lessons/${id}`)
        if (!lessonRes.ok) throw new Error(`Cannot fetch lesson ${id}`)
        const lessonData = await lessonRes.json()
        
        if (lessonData.topicId) {
          const topicRes = await adminFetch(`/api/admin/topics/${lessonData.topicId}`)
          if (topicRes.ok) {
            const topicData = await topicRes.json()
            setTopic(topicData)
          }
        }
        
        if (!isDisposed) setLesson(lessonData)
      } catch (err) {
        if (!isDisposed) setError('Không thể tải thông tin bài học.')
      } finally {
        if (!isDisposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { isDisposed = true }
  }, [id])

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>
  if (error) return <div className="alert alert-danger m-4">{error}</div>
  if (!lesson) return <div className="alert alert-warning m-4">Không tìm thấy bài học.</div>

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Lesson Management"
          title={`Chi tiết bài học: ${lesson.name}`}
          description="Xem chi tiết cấu hình, chủ đề và thời gian cập nhật của bài học."
          actions={
            <Link to="/admin/lessons" className="btn btn-outline-secondary d-flex align-items-center gap-2">
              <ArrowLeft size={18} /> Quay lại danh sách
            </Link>
          }
        />

        <div className="row mt-4">
          <div className="col-12 col-xl-8">
            <AdminSectionCard title="Thông tin chi tiết">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th className="bg-light w-25">ID Hệ thống</th>
                      <td>{lesson.id}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Tên bài học</th>
                      <td className="fw-bold">{lesson.name}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Mô tả</th>
                      <td style={{ whiteSpace: 'pre-wrap' }}>{lesson.description || 'Không có mô tả'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Chủ đề</th>
                      <td>{topic ? topic.name : 'Đang tải...'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Độ khó</th>
                      <td>
                        <Badge tone="neutral">{lesson.difficulty}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Loại nội dung</th>
                      <td>
                        {lesson.isPremium ? (
                          <Badge tone="info">
                            <Star size={12} className="me-1" /> Premium
                          </Badge>
                        ) : (
                          <Badge tone="neutral">Mọi người</Badge>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Trạng thái</th>
                      <td>
                        <Badge tone={lesson.status === 'Đang mở' ? 'success' : 'warning'}>{lesson.status}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày tạo</th>
                      <td>{formatDateTime(lesson.createdAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Cập nhật cuối</th>
                      <td>{formatDateTime(lesson.updatedAt)}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Ngày xóa</th>
                      <td>{lesson.deletedAt ? formatDateTime(lesson.deletedAt) : 'Chưa xóa'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 d-flex gap-2">
                <Link to={`/admin/lessons/${lesson.id}/edit`} className="btn btn-primary d-flex align-items-center gap-2">
                  <Edit size={18} /> Chỉnh sửa
                </Link>
                <Link to={`/admin/lessons/${lesson.id}/delete`} className="btn btn-danger d-flex align-items-center gap-2">
                  <Trash2 size={18} /> Xóa bài học
                </Link>
              </div>
            </AdminSectionCard>
          </div>
          <div className="col-12 col-xl-4">
            <AdminSectionCard title="Ảnh minh họa">
              <div className="text-center">
                <img
                  src={lesson.lessonImage || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={lesson.name}
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
