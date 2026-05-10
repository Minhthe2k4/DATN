import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

import { adminFetch } from '../../utils/api'
import { 
  saveReadingTopic, 
  deleteReadingTopic 
} from './utils/readingUtils'

import { ReadingTopicForm } from './components/ReadingTopicForm'
import { ReadingTopicDeleteConfirmation } from './components/ReadingTopicDeleteConfirmation'

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
          const res = await adminFetch(`/api/admin/reading-topics/${id}`)
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
    if (!draft.name.trim()) { setError('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.'); return }
    setError('')
    try {
      await saveReadingTopic(mode, id, draft)
      setSuccess('Lưu chủ đề thành công!')
      window.setTimeout(() => navigate('/admin/readings'), 1500)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    }
  }

  const handleDelete = async (force = false) => {
    setError('')
    try {
      await deleteReadingTopic(id, force)
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
                <ReadingTopicDeleteConfirmation 
                  name={draft.name}
                  onDelete={handleDelete}
                  onCancel={() => navigate('/admin/readings')}
                  error={error}
                  success={success}
                />
              ) : (
                <ReadingTopicForm 
                  draft={draft}
                  setField={setField}
                  handleSave={handleSave}
                  error={error}
                  success={success}
                />
              )}
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
