import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Clock, BarChart3 } from 'lucide-react'
import ProgressBar from '../../../components/interaction/ProgressBar'
import { makeVideoThumbnail, getDifficultyColor } from '../videoUtils'

export function FavoriteVideoCard({ video, stats, onToggleFavorite }) {
	return (
		<Link to={`/video/channel/watch/${video.id}`} className="video-card-link">
			<article className="video-card video-fav-card">
				<div className="video-card__media-wrap">
					<img src={makeVideoThumbnail(video.title)} alt={video.title} className="video-card__media" />
					<span className="video-card__duration">
						<Clock size={12} style={{ marginRight: '4px' }} />
						{video.duration}
					</span>
				</div>
				<div className="video-card__body">
					<div className="video-card__content">
						<h2>{video.title}</h2>
						<p className="video-card__meta">
							<span className="difficulty-tag" style={{ color: getDifficultyColor(video.difficulty) }}>
								<BarChart3 size={12} style={{ marginRight: '4px' }} />
								{video.difficulty}
							</span>
							<span className="channel-tag"> • {video.channelName || 'N/A'}</span>
						</p>
					</div>
					<div className="video-card__interaction">
						<button 
							className="list-favorite-btn active"
							onClick={(e) => onToggleFavorite(e, video.id)}
							title="Bỏ yêu thích"
						>
							<Heart size={18} fill="#ef4444" color="#ef4444" />
						</button>
						<div className="list-progress-container">
							<ProgressBar percent={stats?.progressPercent || 0} />
						</div>
					</div>
				</div>
			</article>
		</Link>
	)
}
