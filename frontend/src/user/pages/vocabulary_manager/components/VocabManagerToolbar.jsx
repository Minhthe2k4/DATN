import React from 'react'
import { FileDown, Save, Sparkles } from 'lucide-react'

export function VocabManagerToolbar({ onOpenImport, onSaveAll, isSaving }) {
	return (
		<div className="vmanager-toolbar">
			<button 
				type="button" 
				className="vmanager-btn vmanager-btn--ghost" 
				onClick={onOpenImport}
			>
				<FileDown size={18} style={{ marginRight: '8px' }} />
				Nhập dữ liệu
			</button>
			<div className="vmanager-save-notice">
				<Sparkles size={16} className="sparkle-icon" />
				Từ vựng sẽ được lưu vào lộ trình <strong>Thời điểm vàng</strong>.
			</div>
			<button 
				type="button" 
				className="vmanager-btn" 
				onClick={onSaveAll} 
				disabled={isSaving}
			>
				{isSaving ? (
					<>Đang lưu...</>
				) : (
					<>
						<Save size={18} style={{ marginRight: '8px' }} />
						Lưu tất cả
					</>
				)}
			</button>
		</div>
	)
}
