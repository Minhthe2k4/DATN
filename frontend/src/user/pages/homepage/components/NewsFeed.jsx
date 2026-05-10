import React from 'react'

export function NewsFeed({ news }) {
	return (
		<section className="news-feed news-feed--compact">
			<h2 className="news-feed__title">News Feed</h2>
			{news.map((item, idx) => (
				<div key={idx} className="news-card news-card--compact">
					<h3 className="news-card__title">{item.title}</h3>
					<p className="news-card__description">{item.description}</p>
				</div>
			))}
		</section>
	)
}
