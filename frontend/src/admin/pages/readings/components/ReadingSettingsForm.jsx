import React from 'react'
import { AdminSectionCard } from '../../../components/console/AdminUi'

const DIFFICULTY_OPTIONS = ['Dễ', 'Trung bình', 'Khó']
const STATUS_OPTIONS = ['Chờ biên tập', 'Đã xuất bản', 'Nháp']

export function ReadingSettingsForm({ 
  draft, setField, 
  topics, handleCrawl, isCrawling, 
  handleSave, isPreview, setIsPreview 
}) {
  return (
    <div style={{ position: 'sticky', top: '20px' }}>
      <AdminSectionCard title="Thiết lập & Nguồn">
        <div className="mb-3">
          <label className="form-label fw-semibold">URL nguồn (Crawl)</label>
          <div className="input-group">
            <input 
              className="form-control" 
              placeholder="https://..." 
              value={draft.sourceUrl} 
              onChange={e => setField('sourceUrl', e.target.value)} 
            />
            <button className="btn btn-outline-primary" onClick={handleCrawl} disabled={isCrawling}>
              {isCrawling ? '...' : 'Crawl'}
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Chủ đề <span className="text-danger">*</span></label>
          <select 
            className="form-select" 
            value={String(draft.topicId || '')} 
            onChange={e => setField('topicId', e.target.value)}
          >
            <option value="">Chọn chủ đề</option>
            {topics.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Độ khó</label>
          <select 
            className="form-select" 
            value={draft.difficulty} 
            onChange={e => setField('difficulty', e.target.value)}
          >
            {DIFFICULTY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Ảnh bìa (URL)</label>
          <input 
            className="form-control" 
            value={draft.articleImage} 
            onChange={e => setField('articleImage', e.target.value)} 
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Số từ nổi bật</label>
          <input 
            type="number" 
            className="form-control" 
            value={draft.wordsHighlighted} 
            onChange={e => setField('wordsHighlighted', e.target.value)} 
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Trạng thái</label>
          <select 
            className="form-select" 
            value={draft.status} 
            onChange={e => setField('status', e.target.value)}
          >
            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="d-grid gap-2 mt-4">
          <button className="btn btn-primary" onClick={handleSave}>Lưu bài viết</button>
          <button className="btn btn-outline-primary" onClick={() => setIsPreview(!isPreview)}>
            {isPreview ? 'Sửa nội dung' : 'Xem trước'}
          </button>
        </div>
      </AdminSectionCard>
    </div>
  )
}
