import { Link } from 'react-router-dom'
import { Sparkles, Plus, Save, XCircle } from 'lucide-react'

const TYPE_OF_WORD = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'article', 'pronoun']
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUSES = ['Đã duyệt', 'Chờ duyệt']

export function VocabularyForm({ 
  form, 
  setField, 
  onSubmit, 
  generatePronunciation, 
  isGeneratingPronunciation,
  lessonOptions,
  mode 
}) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      {/* Main Info */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Từ tiếng Anh <span className="text-danger">*</span></label>
        <input 
          className="form-control" 
          value={form.word} 
          onChange={(e) => setField('word', e.target.value)} 
          placeholder="resilient" 
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold">Phiên âm <span className="text-danger">*</span></label>
          <div className="input-group">
            <input 
              className="form-control" 
              value={form.pronunciation} 
              onChange={(e) => setField('pronunciation', e.target.value)} 
              placeholder="/rɪˈzɪliənt/" 
            />
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={generatePronunciation}
              disabled={isGeneratingPronunciation}
            >
              {isGeneratingPronunciation ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang gen...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="me-1" /> AI gen
                </>
              )}
            </button>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold">Loại từ <span className="text-danger">*</span></label>
          <select 
            className="form-select" 
            value={form.type_of_word} 
            onChange={(e) => setField('type_of_word', e.target.value)}
          >
            <option value="">— Chọn —</option>
            {TYPE_OF_WORD.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
          </select>
        </div>
      </div>

      {/* Definitions */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Định nghĩa tiếng Anh <span className="text-danger">*</span></label>
        <textarea 
          className="form-control" 
          rows="2" 
          value={form.meaning_en} 
          onChange={(e) => setField('meaning_en', e.target.value)} 
          placeholder="Able to recover quickly from difficulties."
        ></textarea>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Nghĩa tiếng Việt <span className="text-danger">*</span></label>
        <textarea 
          className="form-control" 
          rows="2" 
          value={form.meaning_vi} 
          onChange={(e) => setField('meaning_vi', e.target.value)} 
          placeholder="Kiên cường, bền bỉ, dẻo dai"
        ></textarea>
      </div>

      {/* Example */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Câu ví dụ <span className="text-danger">*</span></label>
        <textarea 
          className="form-control" 
          rows="2" 
          value={form.example} 
          onChange={(e) => setField('example', e.target.value)} 
          placeholder="The startup remained resilient during the downturn."
        ></textarea>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Ví dụ (Tiếng Việt)</label>
        <textarea 
          className="form-control" 
          rows="2" 
          value={form.example_vi} 
          onChange={(e) => setField('example_vi', e.target.value)} 
          placeholder="Công ty khởi nghiệp vẫn kiên cường trong thời kỳ suy thoái."
        ></textarea>
      </div>

      {/* Classification */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold">Bài học <span className="text-danger">*</span></label>
          <select 
            className="form-select" 
            value={form.lesson_id} 
            onChange={(e) => setField('lesson_id', e.target.value)}
          >
            <option value="">— Chọn bài học —</option>
            {lessonOptions.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.name}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold">Độ khó</label>
          <select 
            className="form-select" 
            value={form.level} 
            onChange={(e) => setField('level', e.target.value)}
          >
            {LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
          </select>
        </div>
      </div>

      {/* Status */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Trạng thái duyệt</label>
        <select 
          className="form-select" 
          value={form.status} 
          onChange={(e) => setField('status', e.target.value)}
        >
          {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
        </select>
      </div>

      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
          {mode === 'create' ? <Plus size={18} /> : <Save size={18} />}
          {mode === 'create' ? 'Thêm từ vựng' : 'Lưu thay đổi'}
        </button>
        <Link to="/admin/vocabulary" className="btn btn-outline-secondary d-flex align-items-center gap-2">
          <XCircle size={18} /> Hủy
        </Link>
      </div>
    </form>
  )
}
