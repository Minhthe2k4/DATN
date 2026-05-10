import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { lessons, topics } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'
import { modal } from '../../../utils/modalUtils'
import { 
  ArrowLeft, 
  Trash2, 
  AlertTriangle, 
  XCircle 
} from 'lucide-react'

import { adminFetch } from '../../utils/api'
import { LessonForm } from './components/LessonForm'

function getInitialForm(row, mode) {
  if (mode === 'create') {
    return {
      name: '',
      description: '',
      difficulty: 'Trung bình',
      status: 'Đang mở',
      topic_id: topics[0]?.id || '',
      lessonImage: '',
      isPremium: false,
    }
  }

  return {
    name: row?.name || '',
    description: row?.description || '',
    difficulty: row?.difficulty || 'Trung bình',
    status: row?.status || 'Đang mở',
    topic_id: row?.topic_id || '',
    lessonImage: row?.lessonImage || '',
    isPremium: !!row?.isPremium,
  }
}

export function LessonCrudPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [topicOptions, setTopicOptions] = useState(topics)
  const [currentRow, setCurrentRow] = useState(() => (mode === 'create' ? null : lessons.find((lesson) => String(lesson.id) === String(id)) || null))
  const [form, setForm] = useState(() => getInitialForm(currentRow, mode))
  const [isLoading, setIsLoading] = useState(mode !== 'create')
  
  const topicName = useMemo(() => {
    return topicOptions.find((t) => String(t.id) === String(form.topic_id))?.name || ''
  }, [form.topic_id, topicOptions])

  useEffect(() => {
    let isDisposed = false

    async function loadData() {
      try {
        const topicResponse = await adminFetch(`/api/admin/topics`)
        if (topicResponse.ok) {
          const topicPayload = await topicResponse.json()
          if (!isDisposed && Array.isArray(topicPayload)) {
            setTopicOptions(topicPayload.map((row) => ({ id: row.id, name: row.name })))
          }
        }

        if (mode === 'create') {
          if (!isDisposed) {
            setForm((prev) => ({ ...prev, topic_id: prev.topic_id || topicOptions[0]?.id || '' }))
          }
          return
        }

        const lessonResponse = await adminFetch(`/api/admin/lessons/${id}`)
        if (!lessonResponse.ok) {
          throw new Error(`Cannot fetch lesson: ${lessonResponse.status}`)
        }

        const lessonPayload = await lessonResponse.json()
        if (isDisposed) {
          return
        }

        setCurrentRow(lessonPayload)
        setForm(getInitialForm({
          name: lessonPayload.name,
          description: lessonPayload.description,
          difficulty: lessonPayload.difficulty,
          status: lessonPayload.status,
          topic_id: lessonPayload.topicId,
          lessonImage: lessonPayload.lessonImage,
          isPremium: lessonPayload.isPremium,
        }, mode))
      } catch (err) {
        if (!isDisposed) {
          modal.error('Không thể tải dữ liệu bài học từ backend.')
        }
      } finally {
        if (!isDisposed) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isDisposed = true
    }
  }, [id, mode])

  if (mode !== 'create' && !currentRow && !isLoading) {
    return (
      <div className="page-content">
        <div className="container-fluid">
          <AdminSectionCard title="Không tìm thấy bài học" description={`ID ${id} không có trong dữ liệu.`}>
            <Link to="/admin/lessons" className="btn btn-primary">Quay lại danh sách</Link>
          </AdminSectionCard>
        </div>
      </div>
    )
  }

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const extractError = async (res, defaultMsg) => {
    try {
      const data = await res.json()
      return data.message || defaultMsg
    } catch {
      return defaultMsg
    }
  }

  const onSubmit = async (force = false) => {
    if (mode !== 'delete') {
      if (!form.name.trim()) { modal.warning('Vui lòng nhập tên bài học'); return }
      if (!form.description.trim()) { modal.warning('Vui lòng nhập mô tả bài học'); return }
      if (!form.topic_id) { modal.warning('Vui lòng chọn chủ đề'); return }
    }

    try {
      if (mode === 'create') {
        const response = await adminFetch(`/api/admin/lessons`, {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            topicId: Number(form.topic_id),
            difficulty: form.difficulty,
            status: form.status,
            lessonImage: form.lessonImage,
            isPremium: !!form.isPremium,
          }),
        })
        if (!response.ok) {
          throw new Error(await extractError(response, 'Tạo mới thất bại'))
        }
        modal.success(`Đã thêm bài "${form.name}" thành công.`)
        navigate('/admin/lessons')
        return
      }

      if (mode === 'edit') {
        const response = await adminFetch(`/api/admin/lessons/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            topicId: Number(form.topic_id),
            difficulty: form.difficulty,
            status: form.status,
            lessonImage: form.lessonImage,
            isPremium: !!form.isPremium,
          }),
        })
        if (!response.ok) {
          throw new Error(await extractError(response, 'Cập nhật thất bại'))
        }
        modal.success(`Đã cập nhật bài "${form.name}" thành công.`)
        navigate('/admin/lessons')
        return
      }

      const response = await adminFetch(`/api/admin/lessons/${id}${force ? '?force=true' : ''}`, {
        method: 'DELETE',
      })
      if (!response.ok && response.status !== 204) {
        throw new Error(await extractError(response, 'Xóa thất bại'))
      }

      modal.success(force ? `Đã xóa vĩnh viễn bài "${currentRow.name}".` : `Đã xóa tạm thời bài "${currentRow.name}".`)
      navigate('/admin/lessons')
    } catch (submitError) {
      modal.error(submitError.message || 'Thao tác thất bại. Vui lòng kiểm tra backend và thử lại.')
    }
  }

  const title = mode === 'create' ? 'Thêm bài học' : mode === 'edit' ? 'Sửa bài học' : 'Xóa bài học'

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Lesson Management"
          title={title}
          description={mode === 'delete' ? 'Xác nhận xóa bài học.' : 'Tạo bài học mới với mô tả chi tiết.'}
          actions={
            <Link to="/admin/lessons" className="btn btn-outline-secondary d-flex align-items-center gap-2">
              <ArrowLeft size={18} /> Quay lại danh sách
            </Link>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu bài học...</div> : null}

        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <AdminSectionCard title={title} description={mode === 'delete' ? 'Dữ liệu sẽ được ẩn hoặc xóa hoàn toàn.' : 'Điền thông tin bài học.'}>
              {mode === 'delete' ? (
                <div>
                  <div className="alert alert-danger" role="alert">
                    Bạn chuẩn bị xóa bài học <strong>{currentRow?.name}</strong> (ID: {id}).
                    <br /><br />
                    - <strong>Xóa tạm thời:</strong> Bài học sẽ được chuyển sang trạng thái "Tạm dừng" và ẩn khỏi website, nhưng dữ liệu vẫn được giữ lại để quản lý.
                    <br />
                    - <strong>Xóa vĩnh viễn:</strong> Toàn bộ thông tin về bài học này sẽ bị xóa bỏ hoàn toàn khỏi hệ thống.
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-warning d-flex align-items-center gap-2" onClick={() => onSubmit(false)}>
                      <Trash2 size={18} /> Xóa tạm thời
                    </button>
                    <button type="button" className="btn btn-danger d-flex align-items-center gap-2" onClick={() => onSubmit(true)}>
                      <AlertTriangle size={18} /> Xóa vĩnh viễn
                    </button>
                    <Link to="/admin/lessons" className="btn btn-outline-secondary d-flex align-items-center gap-2">
                      <XCircle size={18} /> Hủy
                    </Link>
                  </div>
                </div>
              ) : (
                <LessonForm 
                  form={form}
                  setField={setField}
                  onSubmit={onSubmit}
                  mode={mode}
                  topicOptions={topicOptions}
                />
              )}

            </AdminSectionCard>
          </div>

          <div className="col-12 col-lg-4">
            <AdminSectionCard title="Hướng dẫn" description="Quy trình tạo bài học">
              <div className="d-grid gap-3 small">
                <div>
                  <strong className="d-block mb-1">1. Tên bài học</strong>
                  <span className="text-muted">Tiêu đề ngắn, rõ ràng, dễ nhớ.</span>
                </div>
                <div>
                  <strong className="d-block mb-1">2. Mô tả</strong>
                  <span className="text-muted">Giải thích nội dung, mục tiêu, số từ vựng...</span>
                </div>
                <div>
                  <strong className="d-block mb-1">3. Chủ đề</strong>
                  <span className="text-muted">Gắn vào chủ đề phù hợp để hỗ trợ tìm kiếm.</span>
                </div>
                <div>
                  <strong className="d-block mb-1">4. Độ khó</strong>
                  <span className="text-muted">Cơ bản, Trung bình, hoặc Nâng cao.</span>
                </div>
              </div>
            </AdminSectionCard>

            {currentRow && (
              <AdminSectionCard title="Thông tin hiện tại" className="mt-3">
                <div className="d-grid gap-2 small">
                  <div>
                    <strong>ID:</strong>
                    <br />
                    <code>{currentRow.id}</code>
                  </div>
                  <div>
                    <strong>Chủ đề:</strong>
                    <br />
                    <span>{topicName || currentRow.topic_id}</span>
                  </div>
                  <div>
                    <strong>Trạng thái:</strong>
                    <br />
                    <span className="badge bg-info">{currentRow.status}</span>
                  </div>
                </div>
              </AdminSectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
