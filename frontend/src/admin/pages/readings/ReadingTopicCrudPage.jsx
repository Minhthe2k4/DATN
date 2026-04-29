import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
export function ReadingTopicCrudPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [draft, setDraft] = useState({
    name: '',
    description: '',
    status: 'Hoạt động',
    articleTopicImage: '',
  })

  const [isLoading, setIsLoading] = useState(mode !== 'create')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (mode !== 'create' && id) {
      async function loadData() {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/reading-topics/${id}`)
          if (res.ok) {
            const data = await res.json()
            setDraft({
              name: data.name || '',
              description: data.description || '',
              status: data.status || 'Hoạt động',
              articleTopicImage: data.articleTopicImage || '',
            })
          }
        } catch (err) {
          setError('Không thể tải dữ liệu chủ đề.')
        } finally {
          setIsLoading(false)
        }
      }
      loadData()
    }
  }, [id, mode])

  const setField = (field, value) => setDraft(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    if (!draft.name.trim()) { setError('Tên chủ đề không được để trống.'); return }
    setError('')
    try {
      const url = `${API_BASE_URL}/api/admin/reading-topics${mode === 'edit' ? `/${id}` : ''}`
      const response = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Lưu thất bại')
      }
      setSuccess('Lưu chủ đề thành công!')
      window.setTimeout(() => navigate('/admin/readings'), 1500)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    }
  }

  const handleDelete = async (force = false) => {
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/reading-topics/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) throw new Error('Xóa thất bại')
      setSuccess(force ? 'Đã xóa vĩnh viễn chủ đề.' : 'Đã tạm dừng chủ đề.')
      window.setTimeout(() => navigate('/admin/readings'), 1500)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    }
  }

  if (isLoading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>

  const pageTitle = mode === 'create' ? 'Thêm chủ đề bài đọc' : mode === 'edit' ? 'Sửa chủ đề bài đọc' : 'Xóa chủ đề bài đọc'

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Reading Topics"
          title={pageTitle}
          description="Quản lý phân loại chủ đề cho các bài đọc trong hệ thống."
          actions={<Link to="/admin/readings" className="btn btn-outline-secondary">Quay lại</Link>}
        />

        <div className="row g-3">
          <div className="col-12 col-lg-8 mx-auto">
            <AdminSectionCard title="Thông tin chủ đề">
              {mode === 'delete' ? (
                <div className="delete-confirmation">
                  <div className="alert alert-danger mb-4">
                     Bạn đang chuẩn bị xóa chủ đề <strong>{draft.name}</strong>.
                    <br /><br />
                    - <strong>Xóa tạm thời (Tạm dừng):</strong> Chủ đề này sẽ bị ẩn khỏi Website, nhưng dữ liệu vẫn được lưu trữ để quản lý.
                    <br />
                    - <strong>Xóa vĩnh viễn:</strong> Gỡ bỏ hoàn toàn chủ đề khỏi hệ thống.
                  </div>
                  <div className="d-flex gap-3">
                    <button className="btn btn-warning px-4" onClick={() => handleDelete(false)}>Tạm dừng</button>
                    <button className="btn btn-danger px-4" onClick={() => handleDelete(true)}>Xóa vĩnh viễn</button>
                    <button className="btn btn-outline-secondary px-4" onClick={() => navigate('/admin/readings')}>Hủy</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Tên chủ đề <span className="text-danger">*</span></label>
                    <input className="form-control form-control-lg" value={draft.name} onChange={e => setField('name', e.target.value)} placeholder="Ví dụ: Công nghệ, Đời sống..." />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Mô tả</label>
                    <textarea className="form-control" rows={4} value={draft.description} onChange={e => setField('description', e.target.value)} placeholder="Mô tả ngắn gọn về chủ đề này..."></textarea>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Trạng thái</label>
                      <select className="form-select" value={draft.status} onChange={e => setField('status', e.target.value)}>
                        <option>Hoạt động</option>
                        <option>Tạm dừng</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Ảnh đại diện chủ đề (URL)</label>
                    <input className="form-control" value={draft.articleTopicImage} onChange={e => setField('articleTopicImage', e.target.value)} placeholder="https://..." />
                    {draft.articleTopicImage && (
                      <div className="mt-3 text-center p-3 border rounded bg-light">
                         <img src={draft.articleTopicImage} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                      </div>
                    )}
                  </div>
                  <div className="d-grid">
                    <button className="btn btn-primary btn-lg" onClick={handleSave}>Lưu thông tin</button>
                  </div>
                </>
              )}
              {error && <div className="alert alert-danger mt-3">{error}</div>}
              {success && <div className="alert alert-success mt-3">{success}</div>}
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
