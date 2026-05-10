import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Plus, Save, XCircle } from 'lucide-react'

export function LessonForm({ 
  form, 
  setField, 
  onSubmit, 
  mode, 
  topicOptions 
}) {
  const DIFFICULTIES = ['Dễ', 'Trung bình', 'Khó']
  const STATUSES = ['Đang mở', 'Nháp']

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      <div className="mb-3">
        <label className="form-label fw-semibold">Tên bài học <span className="text-danger">*</span></label>
        <input 
          className="form-control" 
          value={form.name} 
          onChange={(e) => setField('name', e.target.value)} 
          placeholder="Ví dụ: Email Negotiation Basics" 
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Mô tả bài học <span className="text-danger">*</span></label>
        <textarea 
          className="form-control" 
          rows="3" 
          value={form.description} 
          onChange={(e) => setField('description', e.target.value)} 
          placeholder="Mô tả nội dung bài học, các chủ đề và mục tiêu học tập..."
        ></textarea>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold">Chủ đề <span className="text-danger">*</span></label>
          <select 
            className="form-select" 
            value={form.topic_id} 
            onChange={(e) => setField('topic_id', e.target.value)}
          >
            <option value="">— Chọn chủ đề —</option>
            {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold">Độ khó</label>
          <select 
            className="form-select" 
            value={form.difficulty} 
            onChange={(e) => setField('difficulty', e.target.value)}
          >
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Trạng thái</label>
        <select 
          className="form-select" 
          value={form.status} 
          onChange={(e) => setField('status', e.target.value)}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <small className="form-text text-muted">Đang mở: Xuất hiện trong hệ thống | Nháp: Chưa sẵn sàng</small>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Ảnh bài học (URL)</label>
        <input 
          className="form-control" 
          value={form.lessonImage} 
          onChange={(e) => setField('lessonImage', e.target.value)} 
          placeholder="https://example.com/lesson.png" 
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Loại bài học</label>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="isPremiumSwitch"
            checked={form.isPremium}
            onChange={(e) => setField('isPremium', e.target.checked)}
          />
          <label className="form-check-label d-flex align-items-center gap-2" htmlFor="isPremiumSwitch">
            {form.isPremium ? (
              <>
                <Star size={16} className="text-warning" /> Chỉ dành cho Premium
              </>
            ) : (
              'Mọi người (Miễn phí)'
            )}
          </label>
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
          {mode === 'create' ? <Plus size={18} /> : <Save size={18} />}
          {mode === 'create' ? 'Thêm bài học' : 'Lưu thay đổi'}
        </button>
        <Link to="/admin/lessons" className="btn btn-outline-secondary d-flex align-items-center gap-2">
          <XCircle size={18} /> Hủy
        </Link>
      </div>
    </form>
  )
}
