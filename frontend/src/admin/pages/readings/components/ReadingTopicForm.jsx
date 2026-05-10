import React from 'react'

export function ReadingTopicForm({ draft, setField, handleSave, error, success }) {
  return (
    <>
      <div className="mb-3">
        <label className="form-label fw-bold">Tên chủ đề <span className="text-danger">*</span></label>
        <input 
          className="form-control form-control-lg" 
          value={draft.name} 
          onChange={e => setField('name', e.target.value)} 
          placeholder="Ví dụ: Công nghệ, Đời sống..." 
        />
      </div>
      <div className="mb-3">
        <label className="form-label fw-bold">Mô tả</label>
        <textarea 
          className="form-control" 
          rows={4} 
          value={draft.description} 
          onChange={e => setField('description', e.target.value)} 
          placeholder="Mô tả ngắn gọn về chủ đề này..."
        ></textarea>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-md-12">
          <label className="form-label fw-bold">Trạng thái</label>
          <select className="form-select" value={draft.status} onChange={e => setField('status', e.target.value)}>
            <option>Hoạt động</option>
            <option>Tạm dừng</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="form-label fw-bold">Ảnh đại diện chủ đề (URL)</label>
        <input 
          className="form-control" 
          value={draft.articleTopicImage} 
          onChange={e => setField('articleTopicImage', e.target.value)} 
          placeholder="https://..." 
        />
        {draft.articleTopicImage && (
          <div className="mt-3 text-center p-3 border rounded bg-light">
             <img src={draft.articleTopicImage} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px' }} />
          </div>
        )}
      </div>
      <div className="d-grid">
        <button className="btn btn-primary btn-lg" onClick={handleSave}>Lưu thông tin</button>
      </div>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {success && <div className="alert alert-success mt-3">{success}</div>}
    </>
  )
}
