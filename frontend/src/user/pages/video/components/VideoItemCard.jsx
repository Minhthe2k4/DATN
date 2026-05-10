import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Clock, Sparkles } from 'lucide-react'
import ProgressBar from '../../../components/interaction/ProgressBar'
import { getDifficultyColor } from '../videoUtils'

export function VideoItemCard({ item, channelSlug, userId, stats, onToggleFavorite }) {
	const isFavorite = stats?.isFavorite

	return (
		<Link to={`/video/${channelSlug}/watch/${item.id}`} className="channel-video-card-link">
			<article className="channel-video-card">
				<div className="channel-video-card__media-wrap">
					<img src={item.thumbnail} alt={item.title} className="channel-video-card__media" />
					{item.isOutstanding && (
						<span className="channel-video-card__badge">
							<Sparkles size={12} style={{ marginRight: '4px' }} />
							Nổi bật
						</span>
					)}
					<span className="channel-video-card__duration">
						<Clock size={12} style={{ marginRight: '4px' }} />
						{item.duration}
					</span>
					
					{/* Difficulty badge */}
					<div className="difficulty-badge" style={{ backgroundColor: getDifficultyColor(item.difficulty) }}>
						{item.difficulty}
					</div>
					
					{/* Word count badge */}
					{item.wordsHighlighted > 0 && (
						<div className="word-count-badge">
							{item.wordsHighlighted} từ vựng
						</div>
					)}
				</div>
				<div className="channel-video-card__body">
					<h2>{item.title}</h2>
					{userId && (
						<div className="video-card__interaction">
							<button 
								className={`list-favorite-btn ${isFavorite ? 'active' : ''}`}
								onClick={(e) => onToggleFavorite(e, item.id)}
								title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
							>
								<Heart size={18} fill={isFavorite ? "#ef4444" : "transparent"} color={isFavorite ? "#ef4444" : "#94a3b8"} />
							</button>
							<div className="list-progress-container">
								<ProgressBar percent={stats?.progressPercent || 0} />
							</div>
						</div>
					)}
				</div>
			</article>
		</Link>
	)
}
