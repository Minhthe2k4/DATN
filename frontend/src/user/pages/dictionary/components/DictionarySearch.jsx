import React from 'react'
import { Search } from 'lucide-react'

export function DictionarySearch({ value, onChange, onSearch, loading }) {
	return (
		<form className="dictionary-search" onSubmit={onSearch}>
			<div className="dictionary-search__input-wrap">
				<Search size={20} />
				<input
					type="text"
					placeholder="Tìm từ vựng"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					disabled={loading}
				/>
			</div>
			<button type="submit" className="dictionary-search__lang" disabled={loading}>
				{loading ? 'Đang tải...' : 'Anh - Anh'}
			</button>
		</form>
	)
}
