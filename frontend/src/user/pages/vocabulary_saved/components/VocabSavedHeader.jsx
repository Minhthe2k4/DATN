import React from 'react'
import { CloudUpload, RefreshCcw, ArrowLeft } from 'lucide-react'

export function VocabSavedHeader({ onSync, onRefresh, onBack, isLoading }) {
	return (
		<header className="saved-vocab-header">
			<div>
				<p className="saved-vocab-header__eyebrow">Lộ trình học tập khoa học</p>
				<h1 style={{ color: '#2563eb', textTransform: 'uppercase' }}>Quản lý Thời điểm vàng</h1>
				<p style={{ fontWeight: 'bold', color: '#1e293b' }}>
					Dữ liệu 6 cột dưới đây được đồng bộ 100% với lộ trình học tập của bạn.
				</p>
			</div>
			<div className="saved-vocab-header__actions">
				<button
					type="button"
					className="saved-vocab-sync-btn"
					onClick={onSync}
					disabled={isLoading}
					title="Đưa từ vựng từ máy này vào hệ thống Thời điểm vàng"
				>
					<CloudUpload size={18} style={{ marginRight: '8px' }} />
					Đồng bộ Thời điểm vàng
				</button>
				<button
					type="button"
					className="saved-vocab-refresh-btn"
					onClick={onRefresh}
					disabled={isLoading}
				>
					<RefreshCcw size={18} className={isLoading ? 'spin' : ''} style={{ marginRight: '8px' }} />
					{isLoading ? 'Đang làm mới...' : 'Làm mới'}
				</button>
				<button type="button" className="saved-vocab-header__back" onClick={onBack}>
					<ArrowLeft size={18} style={{ marginRight: '8px' }} />
					Quay lại Học từ vựng
				</button>
			</div>
		</header>
	)
}
