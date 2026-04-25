import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import './Settings.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export default function ManagePersonalInfoPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    async function fetchProfile() {
      const session = getUserSession()
      if (!session) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${session.userId}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setFullName(data.fullName || '')
          setAvatar(data.avatar || '')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage({ type: '', text: '' })
    const session = getUserSession()

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.userId}`
        },
        body: JSON.stringify({ fullName, avatar })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
        setTimeout(() => navigate('/profile'), 1500)
      } else {
        setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu thông tin.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể kết nối đến máy chủ.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="settings-page">Đang tải...</div>
  if (!profile) return <div className="settings-page">Lỗi tải dữ liệu.</div>

  const userInitial = fullName?.charAt(0)?.toUpperCase() || profile.username?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Cài đặt tài khoản</h1>
        <p>Quản lý thông tin cá nhân và thiết lập tài khoản của bạn</p>
      </header>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-section">
        <h2 className="settings-section-title">Thông tin cơ bản</h2>
        
        <div className="horizontal-form-group">
          <label>Ảnh đại diện</label>
          <div className="avatar-upload-wrap">
            <div className="avatar-preview">
              {avatar ? <img src={avatar} alt="Avatar" /> : userInitial}
            </div>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Dán link ảnh tại đây" 
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>
        </div>

        <div className="horizontal-form-group">
          <label>Tên hiển thị</label>
          <input 
            type="text" 
            className="input-field" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="horizontal-form-group">
          <label>Tên đăng nhập</label>
          <input 
            type="text" 
            className="input-field" 
            value={profile.username}
            disabled
          />
        </div>

        <div className="horizontal-form-group">
          <label>Địa chỉ Email</label>
          <input 
            type="email" 
            className="input-field" 
            value={profile.email}
            disabled
          />
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Mật khẩu</h2>
        <div className="horizontal-form-group">
          <label>Mật khẩu hiện tại</label>
          <input type="password" title='Password management is coming soon' className="input-field" placeholder="********" disabled />
        </div>
        <div className="horizontal-form-group">
          <label>Mật khẩu mới</label>
          <input type="password" title='Password management is coming soon' className="input-field" placeholder="Nhập mật khẩu mới" disabled />
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-cancel" onClick={() => navigate('/profile')}>Hủy</button>
        <button className="btn-save" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  )
}
