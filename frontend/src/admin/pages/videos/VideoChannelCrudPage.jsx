import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

import { adminFetch } from '../../utils/api'

import { VideoChannelForm } from './components/VideoChannelForm'
import { VideoChannelDeleteConfirmation } from './components/VideoChannelDeleteConfirmation'

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
          const res = await adminFetch(`/api/admin/video-channels/${id}`)
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
      const response = await adminFetch(`/api/admin/video-channels/fetch-info`, {
        method: 'POST',
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
    if (!draft.name.trim()) { setError('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.'); return }
    setError('')
    try {
      const url = `/api/admin/video-channels${mode === 'edit' ? `/${id}` : ''}`
      const response = await adminFetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
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
      const response = await adminFetch(`/api/admin/video-channels/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
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
                <VideoChannelDeleteConfirmation 
                  draft={draft} 
                  handleDelete={handleDelete} 
                  onCancel={() => navigate('/admin/videos')} 
                />
              ) : (
                <VideoChannelForm 
                  draft={draft} 
                  setField={setField} 
                  handleAutoFetch={handleAutoFetch} 
                  handleSave={handleSave} 
                  isFetching={isFetching} 
                />
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
