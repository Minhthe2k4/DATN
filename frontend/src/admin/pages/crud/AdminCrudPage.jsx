import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { lessons, topics, users, videoLessons } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const ENTITY_CONFIG = {
  topics: {
    title: 'chủ đề',
    singular: 'chủ đề',
    listPath: '/admin/topics',
    data: topics,
    idField: 'id',
    fields: [
      { key: 'name', label: 'Tên chủ đề', required: true },
      { key: 'description', label: 'Mô tả', required: true },
      { key: 'defaultDifficulty', label: 'Độ khó mặc định', required: true },
      { key: 'status', label: 'Trạng thái', required: true },
    ],
  },
  lessons: {
    title: 'bài học',
    singular: 'bài học',
    listPath: '/admin/lessons',
    data: lessons,
    idField: 'id',
    fields: [
      { key: 'title', label: 'Tên bài học', required: true },
      { key: 'topic', label: 'Chủ đề', required: true },
      { key: 'difficulty', label: 'Độ khó', required: true },
      { key: 'status', label: 'Trạng thái', required: true },
    ],
  },
  videos: {
    title: 'video',
    singular: 'video',
    listPath: '/admin/videos',
    data: videoLessons,
    idField: 'id',
    fields: [
      { key: 'title', label: 'Tiêu đề video', required: true },
      { key: 'channelName', label: 'Kênh YouTube', required: true },
      { key: 'topic', label: 'Chủ đề', required: true },
      { key: 'difficulty', label: 'Độ khó', required: true },
      { key: 'status', label: 'Trạng thái', required: true },
    ],
  },
  users: {
    title: 'người dùng',
    singular: 'người dùng',
    listPath: '/admin/users',
    data: users,
    idField: 'id',
    fields: [
      { key: 'email', label: 'Email', required: true, type: 'email' },
      { key: 'status', label: 'Trạng thái', required: true },
      { key: 'premium', label: 'Gói dịch vụ', required: true },
      { key: 'dailyLogin', label: 'Hoạt động gần đây', required: true },
    ],
  },
}

function toTitle(mode, singular) {
  if (mode === 'create') {
    return `Thêm ${singular}`
  }
  if (mode === 'edit') {
    return `Sửa ${singular}`
  }
  return `Xóa ${singular}`
}

function buildInitialValues(config, row, mode) {
  return config.fields.reduce((acc, field) => {
    if (mode === 'create') {
      acc[field.key] = ''
      return acc
    }

    acc[field.key] = row?.[field.key] ?? ''
    return acc
  }, {})
}

export function AdminCrudPage({ entity, mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const config = ENTITY_CONFIG[entity]
  const isTopicEntity = entity === 'topics'

  const currentRow = useMemo(() => {
    if (!config || !id || isTopicEntity) {
      return null
    }

    return config.data.find((item) => item[config.idField] === id) || null
  }, [config, id, isTopicEntity])

  const [apiTopicRow, setApiTopicRow] = useState(null)
  const [isLoading, setIsLoading] = useState(isTopicEntity && mode !== 'create')

  const [formValues, setFormValues] = useState(() => buildInitialValues(config, currentRow, mode))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isTopicEntity || mode === 'create') {
      return
    }

    let isDisposed = false

    async function loadTopic() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/topics/${id}`)
        if (!response.ok) {
          throw new Error(`Cannot fetch topic ${id}`)
        }

        const payload = await response.json()
        if (isDisposed) {
          return
        }

        setApiTopicRow(payload)
        setFormValues(buildInitialValues(config, {
          name: payload.name,
          description: payload.description,
          defaultDifficulty: payload.defaultDifficulty,
          status: payload.status,
        }, mode))
        setError('')
      } catch (loadError) {
        if (!isDisposed) {
          setError('Không thể tải chủ đề từ backend.')
        }
      } finally {
        if (!isDisposed) {
          setIsLoading(false)
        }
      }
    }

    loadTopic()

    return () => {
      isDisposed = true
    }
  }, [config, id, isTopicEntity, mode])

  if (!config) {
    return (
      <div className="page-content">
        <div className="container-fluid">
          <AdminSectionCard title="Không tìm thấy cấu hình" description="Module CRUD này chưa được cấu hình.">
            <Link to="/admin" className="btn btn-primary">Về dashboard</Link>
          </AdminSectionCard>
        </div>
      </div>
    )
  }

  if (mode !== 'create' && !isTopicEntity && !currentRow) {
    return (
      <div className="page-content">
        <div className="container-fluid">
          <AdminSectionCard
            title={`Không tìm thấy ${config.singular}`}
            description={`ID ${id} không tồn tại trong dữ liệu mô phỏng hiện tại.`}
          >
            <Link to={config.listPath} className="btn btn-primary">Quay lại danh sách</Link>
          </AdminSectionCard>
        </div>
      </div>
    )
  }

  if (mode !== 'create' && isTopicEntity && !isLoading && !apiTopicRow) {
    return (
      <div className="page-content">
        <div className="container-fluid">
          <AdminSectionCard
            title="Không tìm thấy chủ đề"
            description={`ID ${id} không tồn tại hoặc backend chưa sẵn sàng.`}
          >
            <Link to={config.listPath} className="btn btn-primary">Quay lại danh sách</Link>
          </AdminSectionCard>
        </div>
      </div>
    )
  }

  const handleFieldChange = (fieldKey, value) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: value }))
  }

  const submit = async () => {
    if (mode !== 'delete') {
      const missing = config.fields.find((field) => field.required && !String(formValues[field.key] || '').trim())
      if (missing) {
        setError(`Vui lòng nhập trường bắt buộc: ${missing.label}.`)
        setSuccess('')
        return
      }
    }

    setError('')

    if (isTopicEntity) {
      try {
        if (mode === 'create') {
          const response = await fetch(`${API_BASE_URL}/api/admin/topics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formValues.name,
              description: formValues.description,
              defaultDifficulty: formValues.defaultDifficulty,
              status: formValues.status,
            }),
          })
          if (!response.ok) {
            throw new Error(`Create topic failed: ${response.status}`)
          }
          setSuccess('Đã tạo chủ đề thành công.')
          return
        }

        if (mode === 'edit') {
          const response = await fetch(`${API_BASE_URL}/api/admin/topics/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formValues.name,
              description: formValues.description,
              defaultDifficulty: formValues.defaultDifficulty,
              status: formValues.status,
            }),
          })
          if (!response.ok) {
            throw new Error(`Update topic failed: ${response.status}`)
          }
          setSuccess(`Đã cập nhật chủ đề ${id} thành công.`)
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/topics/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok && response.status !== 204) {
          throw new Error(`Delete topic failed: ${response.status}`)
        }

        setSuccess(`Đã xóa chủ đề ${id} thành công.`)
        window.setTimeout(() => {
          navigate(config.listPath)
        }, 600)
        return
      } catch (submitError) {
        setSuccess('')
        setError('Thao tác với backend thất bại. Vui lòng thử lại.')
        return
      }
    }

    if (mode === 'create') {
      setSuccess(`Đã tạo ${config.singular} thành công (demo giao diện).`)
      return
    }

    if (mode === 'edit') {
      setSuccess(`Đã cập nhật ${config.singular} ${id} thành công (demo giao diện).`)
      return
    }

    setSuccess(`Đã xóa ${config.singular} ${id} thành công (demo giao diện).`)
    window.setTimeout(() => {
      navigate(config.listPath)
    }, 800)
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Admin CRUD"
          title={toTitle(mode, config.singular)}
          description={`Thao tác ${mode === 'delete' ? 'xóa' : mode === 'edit' ? 'cập nhật' : 'thêm mới'} cho module ${config.title}.`}
          actions={
            <Link to={config.listPath} className="btn btn-outline-secondary">Quay lại danh sách</Link>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}

        <div className="row g-3">
          <div className="col-12 col-xl-8">
            <AdminSectionCard
              title={toTitle(mode, config.singular)}
              description={mode === 'delete' ? 'Xác nhận thao tác xóa trước khi thực hiện.' : 'Điền thông tin theo biểu mẫu bên dưới.'}
            >
              {mode === 'delete' ? (
                <div>
                  <div className="alert alert-danger" role="alert">
                    Bạn đang chuẩn bị xóa {config.singular} <strong>{id}</strong>. Hành động này không thể hoàn tác.
                  </div>
                  <button type="button" className="btn btn-danger" onClick={submit}>Xác nhận xóa</button>
                </div>
              ) : (
                <form onSubmit={(event) => { event.preventDefault(); submit() }}>
                  <div className="row g-3">
                    {config.fields.map((field) => (
                      <div className="col-12" key={field.key}>
                        <label className="form-label fw-semibold">
                          {field.label}
                          {field.required ? <span className="text-danger ms-1">*</span> : null}
                        </label>
                        <input
                          className="form-control"
                          type={field.type || 'text'}
                          value={formValues[field.key]}
                          onChange={(event) => handleFieldChange(field.key, event.target.value)}
                          placeholder={`Nhập ${field.label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary">
                      {mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
                    </button>
                    <Link to={config.listPath} className="btn btn-outline-secondary">Hủy</Link>
                  </div>
                </form>
              )}

              {error ? <div className="text-danger mt-3">{error}</div> : null}
              {success ? <div className="text-success mt-3">{success}</div> : null}
            </AdminSectionCard>
          </div>

          <div className="col-12 col-xl-4">
            <AdminSectionCard
              title="Thông tin nhanh"
              description="Gợi ý thao tác cho trang quản trị"
            >
              <ul className="mb-0 ps-3 d-grid gap-2">
                <li>Luôn kiểm tra dữ liệu bắt buộc trước khi lưu.</li>
                <li>Dùng trang Sửa khi cần cập nhật nội dung hiện có.</li>
                <li>Dùng trang Xóa để xác nhận trước khi loại bỏ dữ liệu.</li>
                <li>Trang này đang ở chế độ demo UI, chưa kết nối API.</li>
              </ul>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
