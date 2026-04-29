import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function VideoChannelCrudPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [draft, setDraft] = useState({
    name: '',
    handle: '',
    url: '',
    description: '',
    subscriberCount: 0,
    status: 'Hoạt động',
    avatar: '',
  })

  const [isLoading, setIsLoading] = useState(mode !== 'create')
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (mode !== 'create' && id) {
      async function loadData() {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/video-channels/${id}`)
          if (res.ok) {
            const data = await res.json()
            setDraft({
              name: data.name || '',
              handle: data.handle || '',
              url: data.url || '',
              description: data.description || '',
              subscriberCount: data.subscriberCount || 0,
              status: data.status || 'Hoạt động',
              avatar: data.avatar || '',
            })
          }
        } catch (err) {
          setError('Không thể tải dữ liệu kênh.')
        } finally {
          setIsLoading(false)
        }
      }
      loadData()
    }
  }, [id, mode])

  const setField = (field, value) => setDraft(prev => ({ ...prev, [field]: value }))

  const handleAutoFetch = async () => {
    if (!draft.url.trim()) {
      setError('Vui lòng nhập URL kênh YouTube trước.')
      return
    }
    setError('')
    setIsFetching(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/video-channels/fetch-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: draft.url }),
      })
      if (!response.ok) throw new Error('Không thể lấy thông tin từ YouTube.')
      const data = await response.json()
      
      setDraft(prev => ({
        ...prev,
        name: data.name || prev.name,
        handle: data.handle || prev.handle,
        avatar: data.avatar || prev.avatar,
        description: data.description || prev.description,
        subscriberCount: parseInt(data.subscriberCount || '0', 10),
      }))
      setSuccess('Đã cập nhật thông tin từ YouTube!')
      window.setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsFetching(false)
    }
  }

  const handleSave = async () => {
    if (!draft.name.trim()) { setError('Tên kênh không được để trống.'); return }
    setError('')
    try {
      const url = `${API_BASE_URL}/api/admin/video-channels${mode === 'edit' ? `/${id}` : ''}`
      const response = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Lưu thất bại')
      }
      setSuccess('Lưu kênh YouTube thành công!')
      window.setTimeout(() => navigate('/admin/videos'), 1500)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    }
  }

  const handleDelete = async (force = false) => {
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/video-channels/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) throw new Error('Xóa thất bại')
      setSuccess(force ? 'Đã xóa vĩnh viễn kênh.' : 'Đã tạm dừng kênh.')
      window.setTimeout(() => navigate('/admin/videos'), 1500)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    }
  }

  if (isLoading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>

  const pageTitle = mode === 'create' ? 'Thêm kênh YouTube' : mode === 'edit' ? 'Sửa kênh YouTube' : 'Xóa kênh YouTube'

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="YouTube Channels"
          title={pageTitle}
          description="Quản lý các nguồn video được crawl từ YouTube."
          actions={<Link to="/admin/videos" className="btn btn-outline-secondary">Quay lại</Link>}
        />

        <div className="row g-3">
          <div className="col-12 col-lg-8 mx-auto">
            <AdminSectionCard title="Thông tin kênh">
              {mode === 'delete' ? (
                <div className="delete-confirmation">
                  <div className="alert alert-danger mb-4">
                     Bạn đang chuẩn bị xóa kênh <strong>{draft.name}</strong>.
                    <br /><br />
                    - <strong>Xóa tạm thời (Tạm dừng):</strong> Kênh sẽ bị ẩn khỏi Website, nhưng vẫn được lưu trữ trong hệ thống quản lý.
                    <br />
                    - <strong>Xóa vĩnh viễn:</strong> Gỡ bỏ hoàn toàn kênh khỏi hệ thống.
                  </div>
                  <div className="d-flex gap-3">
                    <button className="btn btn-warning px-4" onClick={() => handleDelete(false)}>Tạm dừng</button>
                    <button className="btn btn-danger px-4" onClick={() => handleDelete(true)}>Xóa vĩnh viễn</button>
                    <button className="btn btn-outline-secondary px-4" onClick={() => navigate('/admin/videos')}>Hủy</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Link kênh YouTube</label>
                    <div className="input-group">
                      <input 
                        className="form-control" 
                        value={draft.url} 
                        onChange={e => setField('url', e.target.value)} 
                        placeholder="https://www.youtube.com/@channel" 
                      />
                      <button 
                        className="btn btn-info" 
                        type="button" 
                        onClick={handleAutoFetch}
                        disabled={isFetching}
                      >
                        {isFetching ? 'Đang lấy...' : 'Tự động lấy thông tin'}
                      </button>
                    </div>
                    <small className="text-muted">Nhập link kênh và nhấn nút để tự động điền tên, avatar và handle.</small>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Tên kênh <span className="text-danger">*</span></label>
                      <input className="form-control" value={draft.name} onChange={e => setField('name', e.target.value)} placeholder="Ví dụ: TED-Ed" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Handle (@name)</label>
                      <input className="form-control" value={draft.handle} onChange={e => setField('handle', e.target.value)} placeholder="@teded" />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Số lượt đăng ký</label>
                      <input type="number" className="form-control" value={draft.subscriberCount} onChange={e => setField('subscriberCount', parseInt(e.target.value, 10))} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Trạng thái</label>
                      <select className="form-select" value={draft.status} onChange={e => setField('status', e.target.value)}>
                        <option>Hoạt động</option>
                        <option>Tạm dừng</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Mô tả kênh</label>
                    <textarea className="form-control" rows="3" value={draft.description} onChange={e => setField('description', e.target.value)} />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Ảnh đại diện kênh (Avatar URL)</label>
                    <input className="form-control" value={draft.avatar} onChange={e => setField('avatar', e.target.value)} placeholder="https://..." />
                    {draft.avatar && (
                      <div className="mt-3 text-center">
                         <img src={draft.avatar} alt="Preview" className="rounded-circle border shadow-sm" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>

                  <div className="d-grid gap-2">
                    <button className="btn btn-primary btn-lg" onClick={handleSave}>Lưu thông tin kênh</button>
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
