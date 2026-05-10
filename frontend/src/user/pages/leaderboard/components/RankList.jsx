import React from 'react'
import { Clock, Flame } from 'lucide-react'
import { formatStudyTime } from '../leaderboardUtils'

export function RankList({ users }) {
	return (
		<div className="leaderboard-list">
			<div className="list-header">
				<span>Hạng</span>
				<span>Người học</span>
				<span style={{ textAlign: 'right' }}>Thành tích</span>
			</div>
			{users.map((user) => (
				<div key={user.email} className="list-item">
					<div className="list-rank">{user.rank}</div>
					<div className="list-user">
						<div className="list-avatar">
							{user.avatar && user.avatar.length > 2 ? (
								<img src={user.avatar} alt={user.name} />
							) : (
								<span className="avatar-placeholder">{user.avatar || user.name.charAt(0)}</span>
							)}
						</div>
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
	)
}
