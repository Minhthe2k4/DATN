import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import './Settings.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export default function ManagePersonalInfoPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
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
          setPhoneNumber(data.phoneNumber || '')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    setMessage({ type: '', text: '' })
    const session = getUserSession()

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.userId}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setAvatar(data.url)
        setMessage({ type: 'success', text: 'Tải ảnh lên thành công!' })
      } else {
        setMessage({ type: 'error', text: 'Lỗi khi tải ảnh lên.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể kết nối đến máy chủ.' })
    } finally {
      setIsUploading(false)
    }
  }

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
        body: JSON.stringify({ fullName, avatar, phoneNumber })
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
            <div className="avatar-preview" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
              {avatar ? <img src={avatar} alt="Avatar" /> : userInitial}
              {isUploading && <div className="avatar-loading-overlay"><span className="spinner-border spinner-border-sm"></span></div>}
            </div>
            <div className="avatar-upload-info">
              <button className="btn-upload" onClick={handleAvatarClick} disabled={isUploading}>
                {isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              <p className="upload-tip">Nhấp vào ảnh hoặc nút để thay đổi (JPG, PNG)</p>
            </div>
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
          <label>Số điện thoại</label>
          <input 
            type="text" 
            className="input-field" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Nhập số điện thoại"
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
        <button className="btn-save" onClick={handleSave} disabled={isSaving || isUploading}>
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  )
}
