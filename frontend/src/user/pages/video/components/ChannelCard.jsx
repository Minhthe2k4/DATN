import React from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Users, Video } from 'lucide-react'

export function ChannelCard({ channel }) {
	return (
		<Link to={`/video/${channel.slug}`} className="video-card-link">
			<article className="video-card">
				<div className="video-card__media-wrap">
					<img src={channel.thumbnail} alt={channel.name} className="video-card__media" />
					{channel.verified && (
						<div className="video-card__verified-badge">
							<BadgeCheck size={14} style={{ marginRight: '4px' }} />
							Đã xác minh
						</div>
					)}
				</div>
				<div className="video-card__body">
					<img src={channel.avatar} alt="" className="video-card__avatar" />
					<div className="video-card__content">
						<h2>{channel.name}</h2>
						<p className="video-card__handle">{channel.handle}</p>
						<div className="video-card__meta-info">
							<span title="Người theo dõi">
								<Users size={12} style={{ marginRight: '4px' }} />
								{channel.followers}
							</span>
							<span title="Số lượng video">
								<Video size={12} style={{ marginRight: '4px', marginLeft: '8px' }} />
								{channel.videos} video
							</span>
						</div>
					</div>
				</div>
			</article>
		</Link>
	)
}
