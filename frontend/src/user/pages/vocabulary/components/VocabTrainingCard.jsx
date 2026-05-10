import React from 'react'
import { HelpCircle, BookOpen, PlusCircle } from 'lucide-react'

export function VocabTrainingCard({ onNavigate }) {
	return (
		<div className="training-card">
			<div className="training-card__header">
				<h2 className="training-card__title">Luyện tập</h2>
				<button className="help-btn" type="button" aria-label="Trợ giúp">
					<HelpCircle size={20} />
				</button>
			</div>
			<div className="training-card__body">
				<div className="training-illustration">
					<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Cg opacity='0.3'%3E%3Crect x='40' y='60' width='120' height='80' rx='4' fill='%23e5e7eb' /%3E%3Crect x='50' y='50' width='120' height='80' rx='4' fill='%23d1d5db' /%3E%3Crect x='60' y='40' width='120' height='80' rx='4' fill='%23f3f4f6' stroke='%239ca3af' stroke-width='2' /%3E%3C/g%3E%3C/svg%3E" alt="Học từ mới" />
				</div>
				<p className="training-card__message">Bắt đầu hành trình học để nâng cao vốn từ mỗi ngày!</p>
			</div>
			<div className="training-card__footer">
				<div className="training-card__footer-actions">
					<button 
						className="learn-btn" 
						type="button" 
						onClick={() => onNavigate('/vocabulary-lesson')}
					>
						<BookOpen size={18} style={{ marginRight: '8px' }} />
						Học từ mới
					</button>
					<button 
						className="learn-btn learn-btn--secondary" 
						type="button" 
						onClick={() => onNavigate('/vocabulary-manager')}
					>
						<PlusCircle size={18} style={{ marginRight: '8px' }} />
						Thêm từ thủ công
					</button>
				</div>
			</div>
		</div>
	)
}
