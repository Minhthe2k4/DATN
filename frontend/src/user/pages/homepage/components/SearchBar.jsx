import React from 'react'
import { Search, ChevronDown } from 'lucide-react'

export function SearchBar({ value, onChange, onSearch }) {
	return (
		<div className="search-bar">
			<div className="search-bar__input-wrapper">
				<Search size={20} />
				<input
					type="text"
					className="search-bar__input"
					placeholder="Tìm kiếm từ vựng..."
					aria-label="Search vocabulary"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && value.trim()) {
							onSearch(value.trim())
						}
					}}
				/>
			</div>
			<button className="language-selector" type="button" onClick={() => onSearch(value.trim())}>
				Anh - Anh
				<ChevronDown size={18} />
			</button>
		</div>
	)
}
