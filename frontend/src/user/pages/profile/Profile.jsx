import { useEffect, useState } from 'react'
import { getUserSession } from '../../utils/authSession'
import './Profile.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function CrownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6-3 6 3v6l-6 3-6-3V9z" />
      <path d="M12 3v18" />
      <path d="M3 9l9-3 9 3" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      const session = getUserSession()
      if (!session) return

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
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
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
        body: JSON.stringify({ fullName })
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
      } else {
        setMessage({ type: 'error', text: 'Có lỗi xảy ra, vui lòng thử lại.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể kết nối tới máy chủ.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="profile-container">Đang tải...</div>
  }

  if (!profile) {
    return <div className="profile-container">Vui lòng đăng nhập để xem thông tin.</div>
  }

  const userInitial = profile.fullName?.charAt(0)?.toUpperCase() || profile.username?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>Hồ sơ cá nhân</h1>
        {profile.isPremium && (
          <div className="profile-status-badge">
            <CrownIcon /> Tài khoản Premium
          </div>
        )}
      </header>

      <div className="profile-grid">
        <aside className="profile-sidebar">
          <div className="profile-sidebar-card">
            <div className="profile-avatar-container">
              <div className="profile-avatar-large">{userInitial}</div>
              {profile.isPremium && (
                <div className="profile-badge-premium">
                  <CrownIcon /> PRO
                </div>
              )}
            </div>
            <div className="profile-sidebar-info">
              <h2>{profile.fullName || profile.username}</h2>
              <p>{profile.email}</p>
              <div className="profile-status-badge">
                {profile.role === 'ADMIN' ? 'Quản trị viên' : 'Học viên'}
              </div>
            </div>

            <nav className="profile-sidebar-nav">
              <button className="profile-nav-item active">
                <UserIcon /> Thông tin cơ bản
              </button>
              <button className="profile-nav-item">
                <ShieldIcon /> Bảo mật
              </button>
              <button className="profile-nav-item">
                <CrownIcon /> Gói dịch vụ
              </button>
            </nav>
          </div>
        </aside>

        <main className="profile-main-content">
          <section className="profile-card">
            <h3 className="profile-card-title">
              <BookIcon /> Kết quả học tập
            </h3>
            <div className="profile-stats-grid">
              <div className="profile-stat-item">
                <div className="profile-stat-value">{profile.learnedWords}</div>
                <div className="profile-stat-label">Từ đã học</div>
              </div>
              <div className="profile-stat-item">
                <div className="profile-stat-value">{profile.streakDays}</div>
                <div className="profile-stat-label">Ngày học liên tiếp</div>
              </div>
              <div className="profile-stat-item">
                <div className="profile-stat-value">{profile.accuracy?.toFixed(1)}%</div>
                <div className="profile-stat-label">Tỉ lệ chính xác</div>
              </div>
              <div className="profile-stat-item">
                <div className="profile-stat-value">{profile.totalWords}</div>
                <div className="profile-stat-label">Tổng vốn từ</div>
              </div>
            </div>
          </section>

          <section className="profile-card">
            <h3 className="profile-card-title">
              <UserIcon /> Cập nhật thông tin
            </h3>
            <form onSubmit={handleUpdateProfile}>
              {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`}>
                  {message.text}
                </div>
              )}
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label>Username</label>
                  <input type="text" value={profile.username} disabled />
                </div>
                <div className="profile-form-group">
                  <label>Email</label>
                  <input type="text" value={profile.email} disabled />
                </div>
                <div className="profile-form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ tên của bạn"
                  />
                </div>
                <div className="profile-form-group">
                  <label>Ngày tham gia</label>
                  <input type="text" value={new Date(profile.createdAt).toLocaleDateString('vi-VN')} disabled />
                </div>
              </div>
              <button type="submit" className="profile-btn-primary" disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </section>

          <section className="profile-card">
            <h3 className="profile-card-title">
              <ShieldIcon /> Bảo mật & Tài khoản
            </h3>
            <div className="profile-security-item">
              <div className="profile-security-info">
                <h4>Mật khẩu</h4>
                <p>Cập nhật mật khẩu để bảo vệ tài khoản</p>
              </div>
              <button className="profile-btn-outline">Thay đổi</button>
            </div>
            <div className="profile-security-item">
              <div className="profile-security-info">
                <h4>Xác thực 2 yếu tố</h4>
                <p>Chưa kích hoạt</p>
              </div>
              <button className="profile-btn-outline">Kích hoạt</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
