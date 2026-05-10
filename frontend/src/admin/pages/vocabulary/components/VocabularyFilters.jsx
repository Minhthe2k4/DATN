import { FilterTabs } from '../../../components/console/AdminUi'
import { Search } from 'lucide-react'

export function VocabularyFilters({
  activeFilter,
  setActiveFilter,
  selectedLessonId,
  setSelectedLessonId,
  selectedLevel,
  setSelectedLevel,
  selectedType,
  setSelectedType,
  searchTerm,
  setSearchTerm,
  lessonRows
}) {
  return (
    <div className="mb-3">
      <div className="row g-3">
        <div className="col-12 col-md-auto">
          <FilterTabs
            items={['Tất cả', 'Chờ duyệt', 'Đã duyệt']}
            active={activeFilter}
            onChange={setActiveFilter}
          />
        </div>
        <div className="col-12 col-md-auto">
          <select
            className="form-select"
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
          >
            <option value="all">Tất cả bài học</option>
            {lessonRows.map(lesson => (
              <option key={lesson.id} value={lesson.id}>{lesson.name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-auto">
          <select
            className="form-select"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="all">Tất cả mức độ</option>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lv => (
              <option key={lv} value={lv}>{lv}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-auto">
          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">Tất cả loại từ</option>
            <option value="noun">Danh từ (Noun)</option>
            <option value="verb">Động từ (Verb)</option>
            <option value="adjective">Tính từ (Adjective)</option>
            <option value="adverb">Trạng từ (Adverb)</option>
            <option value="preposition">Giới từ (Preposition)</option>
            <option value="conjunction">Liên từ (Conjunction)</option>
          </select>
        </div>
        <div className="col-12 col-md">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Tìm kiếm từ vựng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
