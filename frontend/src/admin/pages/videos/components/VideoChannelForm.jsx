import React from 'react'

export function VideoChannelForm({ 
  draft, 
  setField, 
  handleAutoFetch, 
  handleSave, 
  isFetching 
}) {
  return (
    <>
      <div className="mb-3">
        <label className="form-label fw-bold">Link kênh YouTube</label>
        <div className="input-group">
          <input 
            className="form-control" 
            value={draft.url} 
            onChange={e => setField('url', e.target.value)} 
            placeholder="https://www.youtube.com/@channel" 
          />
          <button 
            className="btn btn-info" 
            type="button" 
            onClick={handleAutoFetch}
            disabled={isFetching}
          >
            {isFetching ? 'Đang lấy...' : 'Tự động lấy thông tin'}
          </button>
        </div>
        <small className="text-muted">Nhập link kênh và nhấn nút để tự động điền tên, avatar và handle.</small>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Tên kênh <span className="text-danger">*</span></label>
          <input className="form-control" value={draft.name} onChange={e => setField('name', e.target.value)} placeholder="Ví dụ: TED-Ed" />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Handle (@name)</label>
          <input className="form-control" value={draft.handle} onChange={e => setField('handle', e.target.value)} placeholder="@teded" />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Số lượt đăng ký</label>
          <input type="number" className="form-control" value={draft.subscriberCount} onChange={e => setField('subscriberCount', parseInt(e.target.value, 10))} />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Trạng thái</label>
          <select className="form-select" value={draft.status} onChange={e => setField('status', e.target.value)}>
            <option>Hoạt động</option>
            <option>Tạm dừng</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Mô tả kênh</label>
        <textarea className="form-control" rows="3" value={draft.description} onChange={e => setField('description', e.target.value)} />
      </div>

      <div className="mb-4">
        <label className="form-label fw-bold">Ảnh đại diện kênh (Avatar URL)</label>
        <input className="form-control" value={draft.avatar} onChange={e => setField('avatar', e.target.value)} placeholder="https://..." />
        {draft.avatar && (
          <div className="mt-3 text-center">
             <img src={draft.avatar} alt="Preview" className="rounded-circle border shadow-sm" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      <div className="d-grid gap-2">
        <button className="btn btn-primary btn-lg" onClick={handleSave}>Lưu thông tin kênh</button>
      </div>
    </>
  )
}
