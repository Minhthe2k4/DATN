import React from 'react'
import { Sparkles } from 'lucide-react'

/**
 * Modal dùng để nhập liệu và lưu từ vựng thủ công vào sổ tay cá nhân.
 * Được sử dụng trong trang Dictionary, tra từ bài báo và trang quản lý từ vựng.
 */
export function SaveVocabModal({ formData, onFormChange, onClose, onSave, loading }) {
	return (
		<div className="dictionary-save-modal-overlay" onClick={onClose}>
			<div className="dictionary-save-modal" onClick={(e) => e.stopPropagation()}>
				<h2 className="dictionary-save-modal__title">Lưu từ vựng</h2>

				<div className="dictionary-save-modal__form">
					<div className="dictionary-save-form__group">
						<label>Từ tiếng Anh</label>
						<input
							type="text"
							value={formData.word}
							onChange={(e) => onFormChange('word', e.target.value)}
						/>
					</div>

					<div className="dictionary-save-form__group">
						<label>Phien am</label>
						<input
							type="text"
							value={formData.pronunciation}
							onChange={(e) => onFormChange('pronunciation', e.target.value)}
						/>
					</div>

					<div className="dictionary-save-form__row">
						<div className="dictionary-save-form__group">
							<label>Định nghĩa (English)</label>
							<textarea
								value={formData.definitionEng}
								onChange={(e) => onFormChange('definitionEng', e.target.value)}
								rows="3"
							/>
						</div>
						<div className="dictionary-save-form__group">
							<label>Định nghĩa (Việt)</label>
							<textarea
								value={formData.definitionVi}
								onChange={(e) => onFormChange('definitionVi', e.target.value)}
								rows="3"
							/>
						</div>
					</div>

					<div className="dictionary-save-form__row">
						<div className="dictionary-save-form__group">
							<label>Ví dụ (English)</label>
							<textarea
								value={formData.exampleEng}
								onChange={(e) => onFormChange('exampleEng', e.target.value)}
								rows="2"
							/>
						</div>
						<div className="dictionary-save-form__group">
							<label>Ví dụ (Việt)</label>
							<textarea
								value={formData.exampleVi}
								onChange={(e) => onFormChange('exampleVi', e.target.value)}
								rows="2"
							/>
						</div>
					</div>

					<div className="dict-save-notice">
						<Sparkles size={18} className="notice-icon" />
						<p>
							Từ vựng sẽ được lưu vào lộ trình ôn tập <strong>Thời điểm vàng</strong> để giúp bạn ghi nhớ lâu dài.
						</p>
					</div>
				</div>

				<div className="dictionary-save-modal__actions">
					<button type="button" className="dict-modal-btn dict-modal-btn--cancel" onClick={onClose}>Hủy</button>
					<button type="button" className="dict-modal-btn dict-modal-btn--save" onClick={onSave} disabled={loading}>
						{loading ? 'Đang lưu...' : 'Lưu'}
					</button>
				</div>
			</div>
		</div>
	)
}
