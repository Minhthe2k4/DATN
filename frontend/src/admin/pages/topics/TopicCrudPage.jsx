import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const DIFFICULTY_OPTIONS = ['Dễ', 'Trung bình', 'Khó']
const STATUS_OPTIONS = ['Hoạt động', 'Tạm dừng']

export function TopicCrudPage({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()

  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    status: 'Hoạt động',
    topicImage: '',
  })
  
  const [isLoading, setIsLoading] = useState(mode !== 'create')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (mode === 'create') return

    let isDisposed = false
    async function loadTopic() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/topics/${id}`)
        if (!response.ok) throw new Error(`Cannot fetch topic ${id}`)
        const payload = await response.json()
        
        if (!isDisposed) {
          setFormValues({
            name: payload.name || '',
            description: payload.description || '',
            status: payload.status || 'Hoạt động',
            topicImage: payload.topicImage || '',
          })
        }
      } catch (err) {
        if (!isDisposed) setError('Không thể tải chủ đề từ backend.')
      } finally {
        if (!isDisposed) setIsLoading(false)
      }
    }
    loadTopic()
    return () => { isDisposed = true }
  }, [id, mode])

  const handleFieldChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }))
  }

  const extractError = async (res, defaultMsg) => {
    try {
      const data = await res.json()
      return data.message || defaultMsg
    } catch {
      return defaultMsg
    }
  }

  const submit = async (force = false) => {
    if (mode !== 'delete') {
      if (!formValues.name.trim()) { setError('Vui lòng nhập Tên chủ đề.'); return }
      if (!formValues.description.trim()) { setError('Vui lòng nhập Mô tả.'); return }
    }

    setError('')
    try {
      if (mode === 'create') {
        const res = await fetch(`${API_BASE_URL}/api/admin/topics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        })
        if (!res.ok) throw new Error(await extractError(res, 'Tạo mới thất bại'))
        setSuccess('Đã tạo chủ đề thành công.')
        window.setTimeout(() => navigate('/admin/topics'), 1500)
        return
      }

      if (mode === 'edit') {
        const res = await fetch(`${API_BASE_URL}/api/admin/topics/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        })
        if (!res.ok) throw new Error(await extractError(res, 'Cập nhật thất bại'))
        setSuccess('Đã cập nhật chủ đề thành công.')
        window.setTimeout(() => navigate('/admin/topics'), 1500)
        return
      }

      // Mode: Delete
      const res = await fetch(`${API_BASE_URL}/api/admin/topics/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error(await extractError(res, 'Xóa thất bại'))
      setSuccess(force ? 'Đã xóa vĩnh viễn chủ đề.' : 'Đã xóa tạm thời chủ đề.')
      window.setTimeout(() => navigate('/admin/topics'), 1500)
    } catch (err) {
      setSuccess('')
      setError(err.message || 'Thao tác thất bại. Vui lòng thử lại.')
    }
  }

  const title = mode === 'create' ? 'Thêm chủ đề' : mode === 'edit' ? 'Sửa chủ đề' : 'Xóa chủ đề'

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Topic Management"
          title={title}
          description={`${mode === 'delete' ? 'Xác nhận xóa' : mode === 'edit' ? 'Cập nhật' : 'Thêm mới'} thông tin chủ đề.`}
          actions={<Link to="/admin/topics" className="btn btn-outline-secondary">Quay lại danh sách</Link>}
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}

        <div className="row g-3">
          <div className="col-12">
            <AdminSectionCard title={title}>
              {mode === 'delete' ? (
                <div>
                  <div className="alert alert-danger">
                    Bạn đang chuẩn bị xóa chủ đề <strong>{formValues.name || id}</strong>.
                    <br /><br />
                    - <strong>Xóa tạm thời:</strong> Chủ đề sẽ được chuyển sang trạng thái "Tạm dừng" và ẩn khỏi website của người học, nhưng dữ liệu vẫn được giữ lại để quản lý.
                    <br />
                    - <strong>Xóa vĩnh viễn:</strong> Toàn bộ thông tin về chủ đề này sẽ bị xóa bỏ hoàn toàn khỏi hệ thống.
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-warning" onClick={() => submit(false)}>Xóa tạm thời</button>
                    <button className="btn btn-danger" onClick={() => submit(true)}>Xóa vĩnh viễn</button>
                    <Link to="/admin/topics" className="btn btn-outline-secondary">Hủy</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); submit() }}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Tên chủ đề <span className="text-danger">*</span></label>
                      <input className="form-control" value={formValues.name} onChange={e => handleFieldChange('name', e.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Trạng thái <span className="text-danger">*</span></label>
                      <select className="form-select" value={formValues.status} onChange={e => handleFieldChange('status', e.target.value)}>
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Ảnh chủ đề (URL)</label>
                      <input className="form-control" value={formValues.topicImage} onChange={e => handleFieldChange('topicImage', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Mô tả <span className="text-danger">*</span></label>
                      <textarea className="form-control" rows="3" value={formValues.description} onChange={e => handleFieldChange('description', e.target.value)} />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary">{mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}</button>
                    <Link to="/admin/topics" className="btn btn-outline-secondary">Hủy</Link>
                  </div>
                </form>
              )}
              {error && <div className="text-danger mt-3">{error}</div>}
              {success && <div className="text-success mt-3">{success}</div>}
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
