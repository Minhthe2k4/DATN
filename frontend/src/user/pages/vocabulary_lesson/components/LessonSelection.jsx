import React from 'react'
import { Crown, Lock, ArrowLeft } from 'lucide-react'

export function LessonSelection({ 
	topic, 
	onPickLesson, 
	onBack, 
	isLoading, 
	isVocabFeatureUnlocked 
}) {
	if (isLoading) {
		return (
			<div className="vlesson-loading-box">
				<div className="spinner-large"></div>
				<p>Đang tải danh sách bài học...</p>
			</div>
		)
	}

	return (
		<section>
			<div className="vlesson-toolbar">
				<button type="button" className="vlesson-ghost" onClick={onBack}>
					<ArrowLeft size={18} style={{ marginRight: '8px' }} />
					Quay lại chủ đề
				</button>
				<div className="vlesson-section-title">{topic?.title}</div>
			</div>

			{!topic?.lessons || topic.lessons.length === 0 ? (
				<div className="vlesson-empty-box">
					<p>Chủ đề này chưa có bài học nào.</p>
				</div>
			) : (
				<div className="vlesson-grid vlesson-grid--lessons">
					{topic.lessons.map((lesson) => {
						const isLocked = lesson.isPremium && !isVocabFeatureUnlocked
						
						return (
							<button 
								key={lesson.id} 
								type="button" 
								className={`vlesson-lesson ${isLocked ? 'is-locked' : ''}`} 
								onClick={() => onPickLesson(lesson.id)}
							>
								{lesson.image && lesson.image !== "" && (
									<div className="vlesson-lesson__image-container">
										<img src={lesson.image} alt={lesson.title} className="vlesson-lesson__image" />
									</div>
								)}
								<div className="vlesson-lesson__header">
									<h3>{lesson.title}</h3>
									{lesson.isPremium && (
										<Crown size={18} className="premium-icon" />
									)}
								</div>
								<p>{lesson.description}</p>
								<div className="vlesson-lesson__footer">
									<span>{lesson.words ? lesson.words.length : 0} từ vựng</span>
									{isLocked && (
										<span className="vlesson-lock-tag">
											<Lock size={12} /> Khóa
										</span>
									)}
								</div>
							</button>
						)
					})}
				</div>
			)}
		</section>
	)
}
