import React from 'react'

export function HotSearch({ vocab, onTagClick }) {
	return (
		<section className="hot-search" aria-label="Từ vựng gợi ý">
			<h2 className="hot-search__title">Từ vựng gợi ý</h2>
			<p className="hot-search__subtitle">Ưu tiên từ phổ biến và những từ bạn đã tra gần đây.</p>
			<div className="hot-search__tags">
				{vocab.map((v, idx) => (
					<button key={idx} className="tag" type="button" onClick={() => onTagClick(v.word)}>
						{v.word}
					</button>
				))}
			</div>
		</section>
	)
}
