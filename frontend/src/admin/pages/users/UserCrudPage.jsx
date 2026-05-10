import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'
import { modal } from '../../../utils/modalUtils'

import { 
  fetchUserById, 
  updateUser, 
  deleteUser 
} from './utils/userUtils'

import { UserForm } from './components/UserForm'
import { UserDeleteConfirmation } from './components/UserDeleteConfirmation'

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

  useEffect(() => {
    if (mode !== 'create' && id) {
      async function loadData() {
        try {
          const data = await fetchUserById(id)
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
        } catch (err) {
          modal.error('Không thể tải dữ liệu người dùng.')
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
      modal.warning('Username và Email là bắt buộc.')
      return
    }
    try {
      await updateUser(id, draft)
      modal.success('Cập nhật người dùng thành công!')
      navigate('/admin/users')
    } catch (err) {
      modal.error(err.message || 'Thao tác thất bại.')
    }
  }

  const handleDelete = async (force = false) => {
    try {
      await deleteUser(id, force)
      modal.success(force ? 'Đã xóa vĩnh viễn tài khoản.' : 'Đã tạm khóa tài khoản.')
      navigate('/admin/users')
    } catch (err) {
      modal.error(err.message || 'Thao tác thất bại.')
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
                <UserDeleteConfirmation 
                  draft={draft} 
                  handleDelete={handleDelete} 
                  onCancel={() => navigate('/admin/users')} 
                />
              ) : (
                <UserForm 
                  draft={draft} 
                  setField={setField} 
                  handleSave={handleSave} 
                />
              )}
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
