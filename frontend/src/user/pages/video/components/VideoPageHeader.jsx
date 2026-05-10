import React from 'react'
import { Search } from 'lucide-react'

export function VideoPageHeader({ viewMode, setViewMode, searchTerm, setSearchTerm }) {
	return (
		<header className="video-page__header">
			<p className="video-page__eyebrow">Luyện nghe qua video</p>
			<h1 className="video-page__title">Chọn kênh và bắt đầu học</h1>
			<p className="video-page__subtitle">Theo dõi các kênh phù hợp trình độ để luyện từ vựng, ngữ cảnh và phát âm tự nhiên.</p>
			<div className="video-page__header-bottom">
				<div className="video-page__view-selector">
					<button 
						className={`view-tab ${viewMode === 'channels' ? 'is-active' : ''}`}
						onClick={() => setViewMode('channels')}
					>
						Kênh video
					</button>
					<button 
						className={`view-tab ${viewMode === 'favorites' ? 'is-active' : ''}`}
						onClick={() => setViewMode('favorites')}
					>
						❤️ Yêu thích
					</button>
				</div>
				<div className="video-search">
					<Search size={18} className="search-icon" />
					<input 
						type="text" 
						placeholder={viewMode === 'channels' ? "Tìm kiếm kênh..." : "Tìm kiếm video đã lưu..."}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>
		</header>
	)
}
