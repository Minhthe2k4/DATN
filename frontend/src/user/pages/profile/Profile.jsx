import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserSession, getAuthHeader } from '../../utils/authSession'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ProfileSidebar } from './components/ProfileSidebar'
import { StatsGrid } from './components/StatsGrid'
import { StudyChart } from './components/StudyChart'
import { PaymentHistory } from './components/PaymentHistory'
import './Profile.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export default function Profile() {
  const navigate = useNavigate()
  const session = getUserSession()
  const [profile, setProfile] = useState(session)
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
            ...getAuthHeader()
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


  if (!profile && !isLoading) return <div className="profile-page">Lỗi tải dữ liệu.</div>

  const userInitial = profile?.fullName?.charAt(0)?.toUpperCase() || profile?.username?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Quay lại">
          <ArrowLeft size={20} />
        </button>
        <div className="profile-header-text">
          <h1>Trung tâm Cá nhân</h1>
          <p>Theo dõi tiến trình học tập của bạn</p>
        </div>
      </header>

      <div className="profile-grid">
        <ProfileSidebar 
          profile={profile} 
          userInitial={userInitial} 
          onEditClick={() => navigate('/settings')} 
          isLoading={isLoading}
        />

        <main className="profile-main">
          <StatsGrid profile={profile} isLoading={isLoading} />
          <StudyChart isLoading={isLoading} />
          <PaymentHistory 
            profile={profile} 
            onUpgradeClick={() => navigate('/premium')} 
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  )
}
