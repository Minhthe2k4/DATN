import React from 'react'

export function VideoForm({ 
  videoDraft, 
  setField, 
  channels, 
  mode, 
  handleFetchMetadata, 
  handleUpload, 
  handleSaveMetadata, 
  isUploading 
}) {
  return (
    <div className="card-body">
      <div className="mb-3">
        <label className="form-label fw-semibold">Tiêu đề video <span className="text-danger">*</span></label>
        <input 
          className="form-control" 
          value={videoDraft.title} 
          onChange={e => setField('title', e.target.value)} 
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Kênh <span className="text-danger">*</span></label>
          <select 
            className="form-select" 
            value={videoDraft.channelId} 
            onChange={e => setField('channelId', e.target.value)}
          >
            <option value="">Chọn kênh</option>
            {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold">Độ khó</label>
          <select 
            className="form-select" 
            value={videoDraft.difficulty} 
            onChange={e => setField('difficulty', e.target.value)}
          >
            {['Dễ', 'Trung bình', 'Khó'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Trạng thái</label>
        <select 
          className="form-select" 
          value={videoDraft.status} 
          onChange={e => setField('status', e.target.value)}
        >
          <option value="Công khai">Đã xuất bản</option>
          <option value="Chờ biên tập">Chờ biên tập</option>
          <option value="Nháp">Nháp</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Thumbnail (URL)</label>
        <input 
          className="form-control" 
          placeholder="Link ảnh thumbnail..." 
          value={videoDraft.thumbnail} 
          onChange={e => setField('thumbnail', e.target.value)} 
        />
        {videoDraft.thumbnail && (
          <div className="mt-2 text-center">
            <img 
              src={videoDraft.thumbnail} 
              alt="Thumbnail preview" 
              className="img-fluid rounded border" 
              style={{ maxHeight: '150px' }} 
            />
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Thời lượng</label>
        <input 
          className="form-control" 
          placeholder="Ví dụ: 5:30" 
          value={videoDraft.duration} 
          onChange={e => setField('duration', e.target.value)} 
        />
      </div>

      {mode === 'create' ? (
        <div className="mt-4 p-3 border rounded bg-light">
          <h6 className="mb-3">YouTube Link & Phụ đề AI</h6>
          <div className="mb-3">
            <label className="form-label fw-semibold small">URL YouTube <span className="text-danger">*</span></label>
            <div className="input-group mb-2">
              <input 
                className="form-control" 
                placeholder="https://youtube.com/watch?v=..." 
                value={videoDraft.youtubeUrl} 
                onChange={e => setField('youtubeUrl', e.target.value)} 
              />
              <button 
                className="btn btn-outline-info" 
                type="button" 
                onClick={handleFetchMetadata}
              >
                Lấy Metadata
              </button>
            </div>
          </div>
          <button 
            className="btn btn-primary w-100" 
            onClick={handleUpload} 
            disabled={isUploading}
          >
            {isUploading ? 'Đang xử lý...' : 'Bắt đầu xử lý video & phụ đề AI'}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button className="btn btn-primary" onClick={handleSaveMetadata}>Lưu thay đổi</button>
        </div>
      )}
    </div>
  )
}
