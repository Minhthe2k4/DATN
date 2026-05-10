import React from 'react'
import { Clock, Zap, Trophy, BookOpen, Target } from 'lucide-react'

export function StatsGrid({ profile, isLoading }) {
	const stats = [
		{ 
			label: 'THỜI GIAN HỌC', 
			value: profile ? `${(profile.totalStudyTime || 0).toFixed(1)}h` : '0h', 
			icon: <Clock size={24} />,
			color: 'blue'
		},
		{ 
			label: 'STREAK', 
			value: profile ? `${profile.streakDays || 0} ngày` : '0 ngày', 
			icon: <Zap size={24} />,
			color: 'orange'
		},
		{ 
			label: 'THỨ HẠNG', 
			value: profile ? `#${profile.rank || '---'}` : '#---', 
			icon: <Trophy size={24} />,
			color: 'red'
		},
		{ 
			label: 'TỪ ĐÃ THUỘC', 
			value: profile ? (profile.learnedWords || 0) : 0, 
			icon: <BookOpen size={24} />,
			color: 'purple'
		},
		{ 
			label: 'ĐỘ CHÍNH XÁC', 
			value: profile ? `${profile.accuracy?.toFixed(1) || 0}%` : '0%', 
			icon: <Target size={24} />,
			color: 'green'
		},
		{ 
			label: 'TỔNG TỪ ĐANG HỌC', 
			value: profile ? (profile.totalWords || 0) : 0, 
			icon: <BookOpen size={24} />,
			color: 'sky'
		}
	]

	return (
		<div className="stats-grid">
			{stats.map((stat, idx) => (
				<div key={idx} className={`stat-card stat-card--${stat.color}`}>
					<div className="stat-icon">{stat.icon}</div>
					<div className="stat-info">
						<label>{stat.label}</label>
						<span className={isLoading ? 'skeleton skeleton-text' : ''}>{stat.value}</span>
					</div>
				</div>
			))}
		</div>
	)
}
