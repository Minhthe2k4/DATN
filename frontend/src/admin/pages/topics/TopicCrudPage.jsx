import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'
import { modal } from '../../../utils/modalUtils'

import { adminFetch } from '../../utils/api'
const DIFFICULTY_OPTIONS = ['Dễ', 'Trung bình', 'Khó']
const STATUS_OPTIONS = ['Hoạt động', 'Tạm dừng']

import { TopicForm } from './components/TopicForm'
import { TopicDeleteConfirmation } from './components/TopicDeleteConfirmation'

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

  useEffect(() => {
    if (mode === 'create') return

    let isDisposed = false
    async function loadTopic() {
      try {
        const response = await adminFetch(`/api/admin/topics/${id}`)
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
        if (!isDisposed) modal.error('Không thể tải chủ đề từ backend.')
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
      if (!formValues.name.trim()) { modal.warning('Vui lòng nhập Tên chủ đề.'); return }
      if (!formValues.description.trim()) { modal.warning('Vui lòng nhập Mô tả.'); return }
    }

    try {
      if (mode === 'create') {
        const res = await adminFetch(`/api/admin/topics`, {
          method: 'POST',
          body: JSON.stringify(formValues),
        })
        if (!res.ok) throw new Error(await extractError(res, 'Tạo mới thất bại'))
        modal.success('Đã tạo chủ đề thành công.')
        navigate('/admin/topics')
        return
      }

      if (mode === 'edit') {
        const res = await adminFetch(`/api/admin/topics/${id}`, {
          method: 'PUT',
          body: JSON.stringify(formValues),
        })
        if (!res.ok) throw new Error(await extractError(res, 'Cập nhật thất bại'))
        modal.success('Đã cập nhật chủ đề thành công.')
        navigate('/admin/topics')
        return
      }

      // Mode: Delete
      const res = await adminFetch(`/api/admin/topics/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error(await extractError(res, 'Xóa thất bại'))
      modal.success(force ? 'Đã xóa vĩnh viễn chủ đề.' : 'Đã xóa tạm thời chủ đề.')
      navigate('/admin/topics')
    } catch (err) {
      modal.error(err.message || 'Thao tác thất bại. Vui lòng thử lại.')
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
                <TopicDeleteConfirmation 
                  topicName={formValues.name} 
                  topicId={id} 
                  onConfirm={submit} 
                />
              ) : (
                <TopicForm 
                  formValues={formValues} 
                  handleFieldChange={handleFieldChange} 
                  onSubmit={submit} 
                  mode={mode} 
                />
              )}
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
