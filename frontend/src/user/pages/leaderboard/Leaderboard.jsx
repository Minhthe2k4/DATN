import { useEffect, useState } from 'react'
import './leaderboard.css'

function CupIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34" />
            <path d="M18 4H6v7a6 6 0 0 0 12 0V4Z" />
        </svg>
    )
}

function ClockIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

function FireIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.256 1.189-3.103.14-.157.389-.255.511-.097.122.158.2.403.1.5-.1.1-.3.5-.3 1a3.5 3.5 0 0 0 4 3.2z" />
        </svg>
    )
}

export function Leaderboard() {
    const [leaderboardData, setLeaderboardData] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
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

        fetchLeaderboard()
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

    // Reorder top three for podium: [2, 1, 3]
    const podiumData = []
    if (topThree[1]) podiumData.push({ ...topThree[1], podiumRank: 2 })
    if (topThree[0]) podiumData.push({ ...topThree[0], podiumRank: 1 })
    if (topThree[2]) podiumData.push({ ...topThree[2], podiumRank: 3 })

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-header">
                <div className="leaderboard-badge">
                    <CupIcon />
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
                                <div className="podium-stat-icon"><ClockIcon /></div>
                                <span className="podium-stat-value">{user.studyTime}h</span>
                                <span className="podium-stat-label">Thời lượng</span>
                            </div>
                            <div className="podium-stat">
                                <div className="podium-stat-icon" style={{ color: '#f97316' }}><FireIcon /></div>
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
                                <ClockIcon />
                                {user.studyTime}h
                            </div>
                            <div className="list-stat list-stat--streak">
                                <FireIcon />
                                {user.streakDays} ngày
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
