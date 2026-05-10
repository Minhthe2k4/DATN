import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, Lock, Loader2, User, Mail, Phone, Type } from 'lucide-react'
import { getUserSession, setUserSession, getAuthHeader } from '../../utils/authSession'
import { AvatarUpload } from './components/AvatarUpload'
import './Settings.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export default function ManagePersonalInfoPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const session = getUserSession()
  const [profile, setProfile] = useState(session)
  const [fullName, setFullName] = useState(session?.fullName || '')
  const [avatar, setAvatar] = useState(session?.avatar || '')
  const [phoneNumber, setPhoneNumber] = useState(session?.phoneNumber || '')
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
            ...getAuthHeader()
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
          ...getAuthHeader()
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setAvatar(data.url)
        
        // Cập nhật session local ngay lập tức để Header thay đổi ảnh
        const session = getUserSession()
        if (session) {
          const updatedSession = { ...session, avatar: data.url }
          setUserSession(updatedSession)
          window.dispatchEvent(new Event('storage'))
        }

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
          ...getAuthHeader()
        },
        body: JSON.stringify({ fullName, avatar, phoneNumber })
      })

      if (response.ok) {
        // Cập nhật session local để Header và các trang khác thấy thay đổi ngay lập tức
        const updatedSession = { ...session, fullName, avatar, phoneNumber }
        setUserSession(updatedSession)
        
        // Kích hoạt sự kiện storage thủ công cho tab hiện tại (vì event storage chỉ bắn sang tab khác)
        window.dispatchEvent(new Event('storage'))

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


  if (!profile && !isLoading) return <div className="settings-page">Lỗi tải dữ liệu.</div>

  const userInitial = fullName?.charAt(0)?.toUpperCase() || profile?.username?.charAt(0)?.toUpperCase() || 'U'

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
        
        <AvatarUpload 
          avatar={avatar}
          userInitial={userInitial}
          isUploading={isUploading}
          onAvatarClick={handleAvatarClick}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
        />

        <div className="horizontal-form-group">
          <label><Type size={16} /> Tên hiển thị</label>
          <input 
            type="text" 
            className={`input-field ${!fullName && isLoading ? 'skeleton skeleton-text' : ''}`} 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="horizontal-form-group">
          <label><Phone size={16} /> Số điện thoại</label>
          <input 
            type="text" 
            className={`input-field ${!phoneNumber && isLoading ? 'skeleton skeleton-text' : ''}`} 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div className="horizontal-form-group is-disabled">
          <label><User size={16} /> Tên đăng nhập</label>
          <input 
            type="text" 
            className={`input-field ${!profile?.username && isLoading ? 'skeleton skeleton-text' : ''}`} 
            value={profile?.username || ''}
            disabled
          />
        </div>

        <div className="horizontal-form-group is-disabled">
          <label><Mail size={16} /> Địa chỉ Email</label>
          <input 
            type="email" 
            className={`input-field ${!profile?.email && isLoading ? 'skeleton skeleton-text' : ''}`} 
            value={profile?.email || ''}
            disabled
          />
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Bảo mật</h2>
        <div className="horizontal-form-group is-disabled">
          <label><Lock size={16} /> Mật khẩu</label>
          <div className="password-placeholder-wrap">
            <input type="password" value="********" className="input-field" disabled />
            <p className="field-hint">Tính năng đổi mật khẩu đang được phát triển.</p>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-cancel" onClick={() => navigate('/profile')}>
          <X size={18} />
          Hủy
        </button>
        <button className="btn-save" onClick={handleSave} disabled={isSaving || isUploading}>
          {isSaving ? <Loader2 className="spinner" size={18} /> : <Save size={18} />}
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  )
}
