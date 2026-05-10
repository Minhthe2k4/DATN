import React from 'react'

export function TopicSelection({ topics, onPickTopic, isLoading }) {
	if (isLoading) {
		return (
			<div className="vlesson-loading-box">
				<div className="spinner-large"></div>
				<p>Đang tải danh sách chủ đề...</p>
			</div>
		)
	}

	if (topics.length === 0) {
		return (
			<div className="vlesson-empty-box">
				<p>Chưa có chủ đề nào. Vui lòng tải lại trang.</p>
			</div>
		)
	}

	return (
		<section>
			<div className="vlesson-section-title">Danh sách chủ đề</div>
			<div className="vlesson-grid">
				{topics.map((topic) => (
					<button key={topic.id} type="button" className="vlesson-tile" onClick={() => onPickTopic(topic.id)}>
						{topic.image ? (
							<img src={topic.image} alt={topic.title} className="vlesson-tile__image" />
						) : (
							<div className="vlesson-tile__image vlesson-tile__image--placeholder" />
						)}
						<div className="vlesson-tile__overlay" />
						<div className="vlesson-tile__content">
							<h3>{topic.title}</h3>
							<p>{topic.description}</p>
						</div>
					</button>
				))}
			</div>
		</section>
	)
}
