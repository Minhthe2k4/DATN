import React from 'react'
import { Clock, Flame, Crown } from 'lucide-react'
import { formatStudyTime } from '../leaderboardUtils'

export function PodiumSection({ podiumData }) {
	return (
		<div className="podium-container">
			{podiumData.map((user) => (
				<div key={user.email} className={`podium-item podium-item--rank${user.podiumRank}`}>
					{user.podiumRank === 1 && (
						<div className="podium-crown">
							<Crown size={32} fill="#fbbf24" color="#fbbf24" />
						</div>
					)}
					<div className="podium-avatar-wrap">
						<div className="podium-avatar">
							{user.avatar && user.avatar.length > 2 ? (
								<img src={user.avatar} alt={user.name} />
							) : (
								<span className="avatar-placeholder">{user.avatar || user.name.charAt(0)}</span>
							)}
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
	)
}
