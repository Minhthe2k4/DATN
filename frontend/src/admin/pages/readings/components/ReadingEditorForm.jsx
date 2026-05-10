import React from 'react'
import { AdminSectionCard } from '../../../components/console/AdminUi'

export function ReadingEditorForm({ draft, setField }) {
  return (
    <AdminSectionCard title="Nội dung bài viết">
      <div className="mb-3">
        <label className="form-label fw-semibold">Tiêu đề bài báo <span className="text-danger">*</span></label>
        <input 
          className="form-control" 
          value={draft.title} 
          onChange={e => setField('title', e.target.value)} 
        />
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Nội dung <span className="text-danger">*</span></label>
        <textarea 
          className="form-control" 
          rows="15" 
          value={draft.content} 
          onChange={e => setField('content', e.target.value)} 
        />
      </div>
    </AdminSectionCard>
  )
}
