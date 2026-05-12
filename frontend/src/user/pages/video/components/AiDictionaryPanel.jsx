import React from 'react'
import { Volume2, X, BookOpen, Sparkles } from 'lucide-react'
import { createPortal } from 'react-dom'
import { speakWord } from '../videoUtils'

export function AiDictionaryPanel({ 
	show, 
	isLookingUp, 
	formData, 
	onClose, 
	onSave 
}) {
	const [container, setContainer] = React.useState(null);

	React.useEffect(() => {
		setContainer(document.body);
	}, []);

	if (!show || !container) return null

	return createPortal(
		<div className="video-watch__dict-overlay" onClick={onClose}>
			<div className="video-watch__quick-dict" onClick={e => e.stopPropagation()}>
				<div className="video-watch__dict-content">
					<header>
						<div className="dict-title-row">
							<h3>{formData.word}</h3>
							{formData.level && <span className="dict-level">{formData.level}</span>}
						</div>
						<div className="dict-header-actions">
							<button className="dict-speak" onClick={() => speakWord(formData.word)} title="Phát âm">
								<Volume2 size={18} />
							</button>
							<span className="dict-phonetic">{formData.pronunciation}</span>
							<button className="dict-close" onClick={onClose}>
								<X size={20} />
							</button>
						</div>
					</header>

					<div className="dict-body">
						{isLookingUp ? (
							<div className="dict-loading">
								<div className="dict-spinner"></div>
								<p>Đang tra cứu từ điển AI...</p>
							</div>
						) : (
							<>
								<div className="dict-section">
									<label><BookOpen size={14} /> Nghĩa tiếng Anh</label>
									<p className="dict-text-en">{formData.definitionEng || '...'}</p>
								</div>
								<div className="dict-section">
									<label>🇻🇳 Nghĩa tiếng Việt</label>
									<p className="dict-text-vi">{formData.definitionVi || '...'}</p>
								</div>

								{formData.contextTranslation && (
									<div className="dict-section dict-context-section">
										<label>Dịch ngữ cảnh</label>
										<p className="dict-context-text">{formData.contextTranslation}</p>
									</div>
								)}

								{formData.example && (
									<div className="dict-section dict-example-section">
										<label>Ví dụ minh họa</label>
										<p className="dict-example-en">"{formData.example}"</p>
									</div>
								)}

								<div className="dict-save-notice">
									<p>
										<Sparkles size={14} style={{ marginRight: '6px' }} />
										Từ vựng sẽ được lưu vào lộ trình <strong>Thời điểm vàng</strong> để giúp bạn ghi nhớ lâu dài.
									</p>
								</div>
							</>
						)}
					</div>

					{!isLookingUp && (
						<div className="dict-footer">
							<button onClick={onSave} className="dict-save-btn">Lưu vào sổ tay cá nhân</button>
						</div>
					)}
				</div>
			</div>
		</div>,
		container
	)
}
