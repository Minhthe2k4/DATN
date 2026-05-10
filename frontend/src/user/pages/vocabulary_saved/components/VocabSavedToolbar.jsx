import React from 'react'
import { Search, Filter } from 'lucide-react'

export function VocabSavedToolbar({ 
	searchTerm, 
	setSearchTerm, 
	filterLesson, 
	setFilterLesson, 
	availableLessons, 
	resultsCount 
}) {
	return (
		<div className="saved-vocab-toolbar">
			<div className="search-group">
				<Search size={18} className="search-icon" />
				<input
					type="search"
					placeholder="Tìm từ muốn sửa hoặc xóa..."
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
				/>
			</div>
			<div className="filter-group">
				<Filter size={18} className="filter-icon" />
				<select
					value={filterLesson}
					onChange={(e) => setFilterLesson(e.target.value)}
					className="lesson-filter-select"
				>
					<option value="all">Tất cả bài học</option>
					<option value="custom">Từ vựng cá nhân</option>
					{availableLessons.map(lesson => (
						<option key={lesson.id} value={lesson.id}>{lesson.name}</option>
					))}
				</select>
			</div>
			<span className="results-count">{resultsCount} từ phù hợp</span>
		</div>
	)
}
