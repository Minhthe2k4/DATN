import React from 'react'
import { Link } from 'react-router-dom'

const STATUS_OPTIONS = ['Hoạt động', 'Tạm dừng']

export function TopicForm({ formValues, handleFieldChange, onSubmit, mode }) {
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit() }}>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold">Tên chủ đề <span className="text-danger">*</span></label>
          <input 
            className="form-control" 
            value={formValues.name} 
            onChange={e => handleFieldChange('name', e.target.value)} 
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold">Trạng thái <span className="text-danger">*</span></label>
          <select 
            className="form-select" 
            value={formValues.status} 
            onChange={e => handleFieldChange('status', e.target.value)}
          >
            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold">Ảnh chủ đề (URL)</label>
          <input 
            className="form-control" 
            value={formValues.topicImage} 
            onChange={e => handleFieldChange('topicImage', e.target.value)} 
          />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Mô tả <span className="text-danger">*</span></label>
          <textarea 
            className="form-control" 
            rows="3" 
            value={formValues.description} 
            onChange={e => handleFieldChange('description', e.target.value)} 
          />
        </div>
      </div>
      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary">
          {mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        </button>
        <Link to="/admin/topics" className="btn btn-outline-secondary">Hủy</Link>
      </div>
    </form>
  )
}
