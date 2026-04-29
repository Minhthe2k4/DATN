import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function UserCrudPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [draft, setDraft] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'USER',
    password: '',
    avatar: '',
    phoneNumber: '',
    isActive: true
  })

  const [isLoading, setIsLoading] = useState(mode !== 'create')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (mode !== 'create' && id) {
      async function loadData() {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`)
          if (res.ok) {
            const data = await res.json()
            setDraft({
              username: data.username || '',
              email: data.email || '',
              fullName: data.fullname || '',
              role: data.role || 'USER',
              password: '', // Không hiển thị mật khẩu cũ
              avatar: data.avatar || '',
              phoneNumber: data.phoneNumber || '',
              isActive: data.isActive
            })
          }
        } catch (err) {
          setError('Không thể tải dữ liệu người dùng.')
        } finally {
          setIsLoading(false)
        }
      }
      loadData()
    }
  }, [id, mode])

  const setField = (field, value) => setDraft(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    if (!draft.username.trim() || !draft.email.trim()) {
      setError('Username và Email là bắt buộc.')
      return
    }
    setError('')
    try {
      const url = `${API_BASE_URL}/api/admin/users/${id}`
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Lưu thất bại')
      }
      setSuccess('Cập nhật người dùng thành công!')
      window.setTimeout(() => navigate('/admin/users'), 1500)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    }
  }

  const handleDelete = async (force = false) => {
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) throw new Error('Xóa thất bại')
      setSuccess(force ? 'Đã xóa vĩnh viễn tài khoản.' : 'Đã tạm khóa tài khoản.')
      window.setTimeout(() => navigate('/admin/users'), 1500)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại.')
    }
  }

  if (isLoading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>

  const pageTitle = mode === 'edit' ? 'Sửa người dùng' : 'Xóa tài khoản'

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="User Operations"
          title={pageTitle}
          description="Quản lý thông tin cá nhân và trạng thái tài khoản."
          actions={<Link to="/admin/users" className="btn btn-outline-secondary">Quay lại</Link>}
        />

        <div className="row g-3">
          <div className="col-12 col-lg-8 mx-auto">
            <AdminSectionCard title="Thông tin người dùng">
              {mode === 'delete' ? (
                <div className="delete-confirmation">
                  <div className="alert alert-danger mb-4">
                     Bạn đang chuẩn bị xóa tài khoản <strong>{draft.username}</strong> ({draft.email}).
                    <br /><br />
                    - <strong>Xóa tạm thời (Tạm khóa):</strong> Tài khoản sẽ bị chuyển sang trạng thái "Bị khóa" và ẩn khỏi các danh sách hoạt động, nhưng dữ liệu vẫn được lưu trữ để đối soát.
                    <br />
                    - <strong>Xóa vĩnh viễn:</strong> Gỡ bỏ hoàn toàn tài khoản khỏi hệ thống. Toàn bộ thông tin và tiến trình học tập sẽ mất vĩnh viễn.
                  </div>
                  <div className="d-flex gap-3">
                    <button className="btn btn-warning px-4" onClick={() => handleDelete(false)}>Xóa tạm thời</button>
                    <button className="btn btn-danger px-4" onClick={() => handleDelete(true)}>Xóa vĩnh viễn</button>
                    <button className="btn btn-outline-secondary px-4" onClick={() => navigate('/admin/users')}>Hủy</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Username <span className="text-danger">*</span></label>
                      <input className="form-control" value={draft.username} onChange={e => setField('username', e.target.value)} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Email <span className="text-danger">*</span></label>
                      <input className="form-control" type="email" value={draft.email} onChange={e => setField('email', e.target.value)} />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Họ và tên</label>
                      <input className="form-control" value={draft.fullName} onChange={e => setField('fullName', e.target.value)} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Số điện thoại</label>
                      <input className="form-control" value={draft.phoneNumber} onChange={e => setField('phoneNumber', e.target.value)} />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold text-primary">Mật khẩu mới</label>
                      <input className="form-control" type="password" placeholder="Để trống nếu không muốn đổi" value={draft.password} onChange={e => setField('password', e.target.value)} />
                      <small className="text-muted">Nhập mật khẩu mới nếu khách hàng yêu cầu đổi.</small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Vai trò</label>
                      <select className="form-select" value={draft.role} onChange={e => setField('role', e.target.value)}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Ảnh đại diện (Avatar URL)</label>
                    <input className="form-control" value={draft.avatar} onChange={e => setField('avatar', e.target.value)} />
                    {draft.avatar && (
                      <div className="mt-3 text-center">
                         <img src={draft.avatar} alt="Preview" className="rounded-circle border" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>

                  <div className="d-grid">
                    <button className="btn btn-primary btn-lg" onClick={handleSave}>Lưu thay đổi</button>
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
