import React from 'react'
import { Search } from 'lucide-react'

export function LessonFilters({
  searchTerm,
  setSearchTerm,
  filterTopicId,
  setFilterTopicId,
  filterDifficulty,
  setFilterDifficulty,
  filterPremium,
  setFilterPremium,
  filterStatus,
  setFilterStatus,
  topicRows
}) {
  return (
    <div className="mb-4">
      <div className="row g-2 mb-2">
        <div className="col-12 col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Tìm theo tên bài..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-12 col-md-4">
          <select
            className="form-select"
            value={filterTopicId}
            onChange={(e) => setFilterTopicId(e.target.value)}
          >
            <option value="">— Tất cả chủ đề —</option>
            {topicRows.map(topic => (
              <option key={topic.id} value={topic.id}>{topic.name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4">
          <select
            className="form-select"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="">— Độ khó —</option>
            {['Dễ', 'Trung bình', 'Khó'].map(lv => (
              <option key={lv} value={lv}>{lv}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="row g-2">
        <div className="col-12 col-md-6">
          <select
            className="form-select"
            value={filterPremium}
            onChange={(e) => setFilterPremium(e.target.value)}
          >
            <option value="All">Tất cả gói</option>
            <option value="Free">Miễn phí</option>
            <option value="Premium">Premium</option>
          </select>
        </div>
        <div className="col-12 col-md-6">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">— Trạng thái —</option>
            <option value="Đang mở">Đang mở</option>
            <option value="Tạm dừng">Tạm dừng</option>
            <option value="Nháp">Bản nháp</option>
          </select>
        </div>
      </div>
    </div>
  )
}
