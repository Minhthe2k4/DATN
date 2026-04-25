import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import './Profile.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const Icons = {
  Back: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Study: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  Streak: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s5 4.2 5 8.4A5 5 0 1112 21a5 5 0 01-5-5.6C7 7.2 12 3 12 3z" />
    </svg>
  ),
  Rank: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6-3 6 3v6l-6 3-6-3V9z" />
      <path d="M12 3v18M3 9l9-3 9 3" />
    </svg>
  ),
  Lessons: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Email: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Edit: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Share: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

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
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  if (isLoading) return <div className="profile-page">Đang tải...</div>
  if (!profile) return <div className="profile-page">Lỗi tải dữ liệu.</div>

  const userInitial = profile.fullName?.charAt(0)?.toUpperCase() || profile.username?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <Icons.Back />
        </button>
        <div className="profile-header-text">
          <h1>Trung tâm Cá nhân</h1>
          <p>Theo dõi tiến trình học tập của bạn</p>
        </div>
      </header>

      <div className="profile-grid">
        {/* Left Card */}
        <aside className="profile-card-left">
          <div className="profile-card-cover"></div>
          <div className="profile-avatar-wrap">
            {profile.avatar ? <img src={profile.avatar} alt="Avatar" /> : userInitial}
          </div>
          <div className="profile-info-basic">
            <h2>{profile.fullName || profile.username}</h2>
            <p>{profile.email}</p>
          </div>

          <div className="profile-details-list">
            <div className="detail-item">
              <div className="detail-icon"><Icons.Email /></div>
              <div className="detail-text">
                <label>Tài khoản</label>
                <span>{profile.email}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon"><Icons.Shield /></div>
              <div className="detail-text">
                <label>Gói dịch vụ</label>
                <span>{profile.isPremium ? 'Tài khoản Premium' : 'Tài khoản Miễn Phí'}</span>
              </div>
            </div>
          </div>

          <div className="profile-card-actions">
            <button className="action-btn" onClick={() => navigate('/settings')}><Icons.Edit /> Cài đặt</button>
            <button className="action-btn"><Icons.Share /> Chia sẻ</button>
          </div>
        </aside>

        {/* Right Stats Section */}
        <main className="profile-main">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><Icons.Study /></div>
              <div className="stat-info">
                <label>THỜI GIAN HỌC</label>
                <span>{(profile.totalStudyTime || 0).toFixed(1)}h</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Icons.Streak /></div>
              <div className="stat-info">
                <label>STREAK</label>
                <span>{profile.streakDays || 0} ngày</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Icons.Rank /></div>
              <div className="stat-info">
                <label>THỨ HẠNG</label>
                <span>#{profile.rank || '---'}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Icons.Lessons /></div>
              <div className="stat-info">
                <label>TỪ ĐÃ THUỘC</label>
                <span>{profile.learnedWords || 0}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Icons.Email /></div>
              <div className="stat-info">
                <label>ĐỘ CHÍNH XÁC</label>
                <span>{profile.accuracy?.toFixed(1) || 0}%</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Icons.Lessons /></div>
              <div className="stat-info">
                <label>TỔNG TỪ ĐANG HỌC</label>
                <span>{profile.totalWords || 0}</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section" style={{gridTemplateColumns: '1fr'}}>
            <div className="chart-item">
              <h3>Tiến độ học tập</h3>
              <p>Tần suất ôn tập từ vựng hàng ngày (phút)</p>
              <div className="chart-container">
                <div className="y-axis">
                  <span>60</span>
                  <span>40</span>
                  <span>20</span>
                  <span>0</span>
                </div>
                <div className="chart-wrapper">
                  <div className="placeholder-chart">
                    <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '40%'}}></div><span>T2</span></div>
                    <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '80%'}}></div><span>T3</span></div>
                    <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '100%'}}></div><span>T4</span></div>
                    <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '30%'}}></div><span>T5</span></div>
                    <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '50%'}}></div><span>T6</span></div>
                    <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '20%'}}></div><span>T7</span></div>
                    <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '45%'}}></div><span>CN</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <section className="payment-history">
            <div className="history-header">
              <h2>Lịch sử nâng cấp</h2>
              {!profile.isPremium && <button className="upgrade-btn" onClick={() => navigate('/premium')}>✨ Nâng cấp Plus</button>}
            </div>
            <table className="history-table">
              <thead>
                <tr>
                  <th>THỜI GIAN</th>
                  <th>GÓI DỊCH VỤ</th>
                  <th>SỐ TIỀN</th>
                  <th>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {profile.isPremium ? (
                    <tr>
                        <td>{new Date(profile.premiumUntil).toLocaleDateString('vi-VN')} (Hết hạn)</td>
                        <td>Gói Premium</td>
                        <td>---</td>
                        <td><span style={{color: '#10b981', fontWeight: 700}}>ĐANG HOẠT ĐỘNG</span></td>
                    </tr>
                ) : (
                    <tr>
                        <td colSpan="4" style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>Chưa có lịch sử giao dịch</td>
                    </tr>
                )}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  )
}
