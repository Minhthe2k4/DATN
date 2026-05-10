import React from 'react'
import { Sparkles, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react'

export function LessonCompletedModal({ data, onReplay, onClose }) {
	if (!data) return null

	return (
		<div className="vlesson-done-overlay" role="dialog" aria-modal="true">
			<div className="vlesson-done-card">
				<div className="vlesson-done-spark vlesson-done-spark--one"><Sparkles size={24} /></div>
				<div className="vlesson-done-spark vlesson-done-spark--two"><Sparkles size={20} /></div>
				<div className="vlesson-done-spark vlesson-done-spark--three"><Sparkles size={16} /></div>

				<div className="vlesson-done-icon-main">
					<CheckCircle2 size={64} color="#22c55e" />
				</div>
				
				<p className="vlesson-done-badge">Hoàn thành bài học</p>
				<h3>Tuyệt vời! Bạn đã học xong</h3>
				<p className="vlesson-done-topic">{data.topicTitle}</p>
				<p className="vlesson-done-lesson">{data.lessonTitle}</p>
				<p className="vlesson-done-summary">Bạn đã học được <strong>{data.totalWords}</strong> từ vựng mới.</p>

				<div className="vlesson-done-actions">
					<button type="button" className="vlesson-primary" onClick={onReplay}>
						<RotateCcw size={18} style={{ marginRight: '8px' }} />
						Học lại từ đầu
					</button>
					<button type="button" className="vlesson-ghost" onClick={onClose}>
						Chọn bài tiếp theo
						<ArrowRight size={18} style={{ marginLeft: '8px' }} />
					</button>
				</div>
			</div>
		</div>
	)
}
