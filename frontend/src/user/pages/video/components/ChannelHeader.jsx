import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function ChannelHeader({ channel }) {
	return (
		<>
			<nav className="video-channel__breadcrumb" aria-label="Điều hướng breadcrumb">
				<Link to="/">Trang chủ</Link>
				<ChevronRight size={14} className="breadcrumb-separator" />
				<Link to="/video">Video</Link>
				<ChevronRight size={14} className="breadcrumb-separator" />
				<strong>{channel.name}</strong>
			</nav>

			<header className="video-channel__hero">
				<div className="video-channel__cover" style={{ '--cover-color': channel.coverColor }} />
				<div className="video-channel__profile">
					<img src={channel.avatar} alt="" className="video-channel__avatar" />
					<div className="video-channel__profile-info">
						<h1>{channel.name}</h1>
						<p>{channel.videos}+ video học tập</p>
					</div>
				</div>
			</header>
		</>
	)
}
