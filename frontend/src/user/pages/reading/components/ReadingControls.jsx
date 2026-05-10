import React from 'react';

export function ReadingControls({ 
    searchTerm, 
    onSearchChange, 
    difficultyFilter, 
    onDifficultyChange 
}) {
    return (
        <div className="reading-controls">
            <div className="search-box">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm bài viết..." 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="filter-box">
                <select 
                    value={difficultyFilter} 
                    onChange={(e) => onDifficultyChange(e.target.value)}
                >
                    <option value="All">Tất cả trình độ</option>
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                </select>
            </div>
        </div>
    );
}
