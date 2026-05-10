import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, BarChart3, Clock } from 'lucide-react'
import ProgressBar from '../../../components/interaction/ProgressBar'
import { getDifficultyColor } from '../videoUtils'

export function VideoWatchHeader({ video, channelSlug, channelName, progressPercent }) {
	return (
		<div className="video-watch__sticky-head">
			<nav className="video-watch__breadcrumb" aria-label="Điều hướng breadcrumb">
				<Link to="/">Trang chủ</Link>
				<ChevronRight size={14} className="breadcrumb-separator" />
				<Link to="/video">Video</Link>
				<ChevronRight size={14} className="breadcrumb-separator" />
				<Link to={`/video/${channelSlug}`}>{channelName}</Link>
				<ChevronRight size={14} className="breadcrumb-separator" />
				<strong>{video.title}</strong>
			</nav>

			<header className="video-watch__header">
				<h1>{video.title}</h1>
				<div className="video-watch__meta-row">
					<span className="video-watch__channel-name">{channelName}</span>
					<span className="video-watch__dot" aria-hidden="true" />
					<span className="video-difficulty-badge" style={{ color: getDifficultyColor(video.difficulty) }}>
						<BarChart3 size={14} style={{ marginRight: '4px' }} />
						{video.difficulty}
					</span>
					<span className="video-watch__dot" aria-hidden="true" />
					<span className="video-watch__duration">
						<Clock size={14} style={{ marginRight: '4px' }} />
						{video.duration}
					</span>
				</div>
				<div className="video-watch__actions">
					<ProgressBar percent={progressPercent} label="Tiến độ xem" />
				</div>
			</header>
		</div>
	)
}
