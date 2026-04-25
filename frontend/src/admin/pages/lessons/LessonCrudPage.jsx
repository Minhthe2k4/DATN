import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { lessons, topics } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const DIFFICULTIES = ['Cơ bản', 'Trung bình', 'Nâng cao']
const STATUSES = ['Đang mở', 'Nháp']

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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(mode !== 'create')

  useEffect(() => {
    let isDisposed = false

    async function loadData() {
      try {
        const topicResponse = await fetch(`${API_BASE_URL}/api/admin/topics`)
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

        const lessonResponse = await fetch(`${API_BASE_URL}/api/admin/lessons/${id}`)
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
        setError('')
      } catch (loadDataError) {
        if (!isDisposed) {
          setError('Không thể tải dữ liệu bài học từ backend.')
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

  const topicName = useMemo(() => {
    return topicOptions.find((t) => String(t.id) === String(form.topic_id))?.name || ''
  }, [form.topic_id, topicOptions])

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onSubmit = async () => {
    if (mode !== 'delete') {
      if (!form.name.trim()) { setError('Vui lòng nhập tên bài học'); return }
      if (!form.description.trim()) { setError('Vui lòng nhập mô tả bài học'); return }
      if (!form.topic_id) { setError('Vui lòng chọn chủ đề'); return }
    }

    try {
      if (mode === 'create') {
        const response = await fetch(`${API_BASE_URL}/api/admin/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
          throw new Error(`Create lesson failed: ${response.status}`)
        }
        setError('')
        setSuccess(`Đã thêm bài "${form.name}" thành công.`)
        return
      }

      if (mode === 'edit') {
        const response = await fetch(`${API_BASE_URL}/api/admin/lessons/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
          throw new Error(`Update lesson failed: ${response.status}`)
        }
        setError('')
        setSuccess(`Đã cập nhật bài "${form.name}" thành công.`)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/lessons/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok && response.status !== 204) {
        throw new Error(`Delete lesson failed: ${response.status}`)
      }

      setError('')
      setSuccess(`Đã xóa bài "${currentRow.name}" thành công.`)
      window.setTimeout(() => navigate('/admin/lessons'), 600)
    } catch (submitError) {
      setSuccess('')
      setError('Thao tác thất bại. Vui lòng kiểm tra backend và thử lại.')
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
          actions={<Link to="/admin/lessons" className="btn btn-outline-secondary">Quay lại danh sách</Link>}
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu bài học...</div> : null}

        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <AdminSectionCard title={title} description={mode === 'delete' ? 'Hành động này không thể hoàn tác.' : 'Điền thông tin bài học.'}>
              {mode === 'delete' ? (
                <div>
                  <div className="alert alert-danger" role="alert">
                    Bạn chuẩn bị xóa bài học <strong>{currentRow?.name}</strong> (ID: {id}). Hành động này không thể hoàn tác.
                  </div>
                  <button type="button" className="btn btn-danger me-2" onClick={onSubmit}>Xác nhận xóa</button>
                  <Link to="/admin/lessons" className="btn btn-outline-secondary">Hủy</Link>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên bài học <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Ví dụ: Email Negotiation Basics" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mô tả bài học <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows="3" value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Mô tả nội dung bài học, các chủ đề và mục tiêu học tập..."></textarea>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Chủ đề <span className="text-danger">*</span></label>
                      <select className="form-select" value={form.topic_id} onChange={(e) => setField('topic_id', e.target.value)}>
                        <option value="">— Chọn chủ đề —</option>
                        {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Độ khó</label>
                      <select className="form-select" value={form.difficulty} onChange={(e) => setField('difficulty', e.target.value)}>
                        {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Trạng thái</label>
                    <select className="form-select" value={form.status} onChange={(e) => setField('status', e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <small className="form-text text-muted">Đang mở: Xuất hiện trong hệ thống | Nháp: Chưa sẵn sàng</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Ảnh bài học (URL)</label>
                    <input className="form-control" value={form.lessonImage} onChange={(e) => setField('lessonImage', e.target.value)} placeholder="https://example.com/lesson.png" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Loại bài học</label>
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="isPremiumSwitch"
                        checked={form.isPremium} 
                        onChange={(e) => setField('isPremium', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="isPremiumSwitch">
                        {form.isPremium ? '👑 Chỉ dành cho Premium' : 'Mọi người (Miễn phí)'}
                      </label>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary">{mode === 'create' ? 'Thêm bài học' : 'Lưu thay đổi'}</button>
                    <Link to="/admin/lessons" className="btn btn-outline-secondary">Hủy</Link>
                  </div>
                </form>
              )}

              {error && <div className="alert alert-danger mt-3">{error}</div>}
              {success && <div className="alert alert-success mt-3">{success}</div>}
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
