import React from 'react'
import { X, FileText, CheckCircle2 } from 'lucide-react'

export function VocabImportModal({ 
	isOpen, 
	onClose, 
	importText, 
	setImportText, 
	termDelimiterMode, 
	setTermDelimiterMode, 
	termCustomDelimiter, 
	setTermCustomDelimiter, 
	cardDelimiterMode, 
	setCardDelimiterMode, 
	cardCustomDelimiter, 
	setCardCustomDelimiter, 
	importPreview, 
	onImport 
}) {
	if (!isOpen) return null

	return (
		<div className="vmanager-modal-backdrop" role="dialog" aria-modal="true">
			<div className="vmanager-modal">
				<div className="vmanager-modal__head">
					<div>
						<h2><FileText size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Nhập dữ liệu</h2>
						<p>Chép và dán dữ liệu ở đây. Mỗi dòng là một thẻ, AI sẽ tự sinh thông tin bổ sung.</p>
					</div>
					<button type="button" className="vmanager-modal__close" onClick={onClose}><X size={20} /></button>
				</div>

				<textarea
					className="vmanager-modal__textarea"
					value={importText}
					onChange={(event) => setImportText(event.target.value)}
					lang="vi"
					placeholder={`Tu 1\tDinh nghia 1\nTu 2\tDinh nghia 2\nTu 3\tDinh nghia 3`}
				/>

				<div className="vmanager-modal__options">
					<div className="vmanager-option-group">
						<h3>Giữa thuật ngữ và định nghĩa</h3>
						<label><input type="radio" name="termDelimiter" checked={termDelimiterMode === 'tab'} onChange={() => setTermDelimiterMode('tab')} /> Tab</label>
						<label><input type="radio" name="termDelimiter" checked={termDelimiterMode === 'comma'} onChange={() => setTermDelimiterMode('comma')} /> Phẩy</label>
						<label className="vmanager-option-group__custom"><input type="radio" name="termDelimiter" checked={termDelimiterMode === 'custom'} onChange={() => setTermDelimiterMode('custom')} /> Tùy chỉnh</label>
						{termDelimiterMode === 'custom' && <input value={termCustomDelimiter} onChange={(event) => setTermCustomDelimiter(event.target.value)} placeholder="Ký tự tách" />}
					</div>

					<div className="vmanager-option-group">
						<h3>Giữa các thẻ</h3>
						<label><input type="radio" name="cardDelimiter" checked={cardDelimiterMode === 'newline'} onChange={() => setCardDelimiterMode('newline')} /> Dòng mới</label>
						<label><input type="radio" name="cardDelimiter" checked={cardDelimiterMode === 'semicolon'} onChange={() => setCardDelimiterMode('semicolon')} /> Chấm phẩy</label>
						<label className="vmanager-option-group__custom"><input type="radio" name="cardDelimiter" checked={cardDelimiterMode === 'custom'} onChange={() => setCardDelimiterMode('custom')} /> Tùy chỉnh</label>
						{cardDelimiterMode === 'custom' && <input value={cardCustomDelimiter} onChange={(event) => setCardCustomDelimiter(event.target.value)} placeholder="Ký tự tách" />}
					</div>
				</div>

				<div className="vmanager-modal__preview">
					<h3>Xem trước <span><CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {importPreview.length} thẻ</span></h3>
					{importPreview.length ? (
						<div className="vmanager-modal__preview-list">
							{importPreview.slice(0, 6).map((item) => (
								<div key={item.id} className="vmanager-modal__preview-item">
									<strong>{item.word}</strong>
									<span>{item.definition || 'Không có định nghĩa đi kèm'}</span>
								</div>
							))}
						</div>
					) : (
						<p>Không có nội dung để xem trước.</p>
					)}
				</div>

				<div className="vmanager-modal__footer">
					<button type="button" className="vmanager-btn vmanager-btn--ghost" onClick={onClose}>Hủy nhập</button>
					<button type="button" className="vmanager-btn" onClick={onImport}>Nhập</button>
				</div>
			</div>
		</div>
	)
}
