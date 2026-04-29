import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession } from '../../utils/authSession'
import './Profile.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

import { ArrowLeft, Clock, Zap, Trophy, BookOpen, Mail, Shield, Edit2, Share2, Target } from 'lucide-react'

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
          <ArrowLeft size={20} />
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
              <div className="detail-icon"><Mail size={18} /></div>
              <div className="detail-text">
                <label>Tài khoản</label>
                <span>{profile.email}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon"><Shield size={18} /></div>
              <div className="detail-text">
                <label>Gói dịch vụ</label>
                <span>{profile.isPremium ? 'Tài khoản Premium' : 'Tài khoản Miễn Phí'}</span>
              </div>
            </div>
          </div>

          <div className="profile-card-actions">
            <button className="action-btn" onClick={() => navigate('/settings')}><Edit2 size={18} /> Cài đặt</button>
            <button className="action-btn"><Share2 size={18} /> Chia sẻ</button>
          </div>
        </aside>

        {/* Right Stats Section */}
        <main className="profile-main">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><Clock size={24} /></div>
              <div className="stat-info">
                <label>THỜI GIAN HỌC</label>
                <span>{(profile.totalStudyTime || 0).toFixed(1)}h</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Zap size={24} /></div>
              <div className="stat-info">
                <label>STREAK</label>
                <span>{profile.streakDays || 0} ngày</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Trophy size={24} /></div>
              <div className="stat-info">
                <label>THỨ HẠNG</label>
                <span>#{profile.rank || '---'}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><BookOpen size={24} /></div>
              <div className="stat-info">
                <label>TỪ ĐÃ THUỘC</label>
                <span>{profile.learnedWords || 0}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Target size={24} /></div>
              <div className="stat-info">
                <label>ĐỘ CHÍNH XÁC</label>
                <span>{profile.accuracy?.toFixed(1) || 0}%</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><BookOpen size={24} /></div>
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
