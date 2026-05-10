import { useEffect, useState } from 'react'
import { Trophy, Loader2 } from 'lucide-react'
import { getPodiumData } from './leaderboardUtils'
import { PodiumSection } from './components/PodiumSection'
import { RankList } from './components/RankList'
import './leaderboard.css'

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
            <div className="leaderboard-page leaderboard-page--loading">
                <Loader2 className="spinner" size={40} />
                <p>Đang tải bảng xếp hạng...</p>
            </div>
        )
    }

    const topThree = leaderboardData.slice(0, 3)
    const restOfUsers = leaderboardData.slice(3)
    const podiumData = getPodiumData(topThree)

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

            <PodiumSection podiumData={podiumData} />
            <RankList users={restOfUsers} />
        </div>
    )
}
