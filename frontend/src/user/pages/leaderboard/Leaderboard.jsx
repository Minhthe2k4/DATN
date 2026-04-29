import { useEffect, useState } from 'react'
import './leaderboard.css'

import { Trophy, Clock, Flame } from 'lucide-react'

export function Leaderboard() {
    const [leaderboardData, setLeaderboardData] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch('/api/user/leaderboard')
            if (response.ok) {
                const data = await response.json()
                setLeaderboardData(data)
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLeaderboard()

        // Lắng nghe sự kiện từ WebSocket để tự động refresh
        window.addEventListener('leaderboard-update', fetchLeaderboard)
        return () => {
            window.removeEventListener('leaderboard-update', fetchLeaderboard)
        }
    }, [])

    if (isLoading) {
        return (
            <div className="leaderboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loading-spinner">Loading...</div>
            </div>
        )
    }

    const topThree = leaderboardData.slice(0, 3)
    const restOfUsers = leaderboardData.slice(3)

    const formatStudyTime = (hours) => {
        if (!hours || hours === 0) return '0 giây'
        if (hours < 1 / 60) { // Less than 1 minute
            const seconds = Math.round(hours * 3600)
            return `${seconds} giây`
        } else if (hours < 1) { // Less than 1 hour
            const minutes = Math.round(hours * 60)
            return `${minutes} phút`
        } else {
            // If it's a whole number, don't show decimals
            return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`
        }
    }

    // Reorder top three for podium: [2, 1, 3]
    const podiumData = []
    if (topThree[1]) podiumData.push({ ...topThree[1], podiumRank: 2 })
    if (topThree[0]) podiumData.push({ ...topThree[0], podiumRank: 1 })
    if (topThree[2]) podiumData.push({ ...topThree[2], podiumRank: 3 })

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-header">
                <div className="leaderboard-badge">
                    <Trophy size={18} />
                    Bảng xếp hạng
                </div>
                <h1>Top <span>Học Viên</span> Xuất Sắc</h1>
                <p className="leaderboard-desc">
                    Nơi vinh danh những nỗ lực không ngừng nghỉ. Mỗi phút bạn học là một bước tiến gần hơn tới mục tiêu của chính mình.
                </p>
            </div>

            <div className="podium-container">
                {podiumData.map((user) => (
                    <div key={user.email} className={`podium-item podium-item--rank${user.podiumRank}`}>
                        {user.podiumRank === 1 && <div className="podium-crown">👑</div>}
                        <div className="podium-avatar-wrap">
                            <div className="podium-avatar">
                                {user.avatar}
                            </div>
                            <div className="podium-rank-badge">{user.rank}</div>
                        </div>
                        <h3 className="podium-name">{user.name}</h3>
                        <div className="podium-stats">
                            <div className="podium-stat">
                                <div className="podium-stat-icon"><Clock size={16} /></div>
                                <span className="podium-stat-value">{formatStudyTime(user.studyTime)}</span>
                                <span className="podium-stat-label">Thời lượng</span>
                            </div>
                            <div className="podium-stat">
                                <div className="podium-stat-icon" style={{ color: '#f97316' }}><Flame size={16} /></div>
                                <span className="podium-stat-value">{user.streakDays} ngày</span>
                                <span className="podium-stat-label">Chuỗi học</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="leaderboard-list">
                <div className="list-header">
                    <span>Hạng</span>
                    <span>Người học</span>
                    <span style={{ textAlign: 'right' }}>Thành tích</span>
                </div>
                {restOfUsers.map((user) => (
                    <div key={user.email} className="list-item">
                        <div className="list-rank">{user.rank}</div>
                        <div className="list-user">
                            <div className="list-avatar">{user.avatar}</div>
                            <div className="list-user-info">
                                <span className="list-user-name">{user.name}</span>
                                <span className="list-user-email">{user.email}</span>
                            </div>
                        </div>
                        <div className="list-achievements">
                            <div className="list-stat list-stat--time">
                                <Clock size={16} />
                                {formatStudyTime(user.studyTime)}
                            </div>
                            <div className="list-stat list-stat--streak">
                                <Flame size={16} />
                                {user.streakDays} ngày
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
