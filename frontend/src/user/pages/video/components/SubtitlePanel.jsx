import React from 'react'
import { Settings, HelpCircle } from 'lucide-react'
import { formatTime } from '../videoUtils'

export function SubtitlePanel({ segments, activeSubtitleId, onSubtitleClick }) {
	return (
		<aside className="video-watch__subtitles">
			<header className="subtitles-header">
				<h2>Phụ đề ({segments.length})</h2>
				<Settings size={18} className="sub-settings-icon" />
			</header>
			<div className="video-watch__subtitle-list">
				{segments.length === 0 ? (
					<div className="subtitles-empty">
						<HelpCircle size={40} />
						<p>Chưa có phụ đề.<br /><small>Video có thể đang được xử lý.</small></p>
					</div>
				) : segments.map((seg) => {
					return (
						<button
							key={seg.id}
							id={`subtitle-${seg.id}`}
							type="button"
							onClick={() => onSubtitleClick(seg)}
							className={`video-watch__subtitle-item${activeSubtitleId === seg.id ? ' is-active' : ''}`}
						>
							<span className="video-watch__subtitle-time">{formatTime(seg.startSec)}</span>
							<span className="video-watch__subtitle-text">{seg.text}</span>
						</button>
					)
				})}
			</div>
		</aside>
	)
}
