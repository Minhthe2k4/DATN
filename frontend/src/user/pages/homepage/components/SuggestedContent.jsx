import React from 'react'
import { FileText, Video, Dice5 } from 'lucide-react'

export function SuggestedContent({ content, onContentClick }) {
	return (
		<section className="suggested-content">
			<h2 className="section-title">Suggested Content</h2>
			<div className="content-list">
				{content.map((item, idx) => (
					<article key={idx} className="content-item" style={{ cursor: 'pointer' }} onClick={() => onContentClick(item)}>
						{item.type === 'article' && <FileText size={24} color="#8B5CF6" />}
						{item.type === 'video' && <Video size={24} color="#EF4444" />}
						{item.type === 'tip' && <Dice5 size={24} color="#10B981" />}
						<h3 className="content-item__title">{item.title}</h3>
					</article>
				))}
			</div>
		</section>
	)
}
