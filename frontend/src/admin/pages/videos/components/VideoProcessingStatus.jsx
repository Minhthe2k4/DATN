import React from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'

export function VideoProcessingStatus({ subtitleStatus }) {
  if (subtitleStatus === 'IDLE') return null
  
  return (
    <div className="card-body">
      <div className="text-center p-3">
        {subtitleStatus === 'PROCESSING' && (
          <>
            <div className="spinner-border text-primary mb-2" />
            <p className="text-muted">AI đang bóc tách âm thanh và tạo phụ đề. Vui lòng đợi...</p>
          </>
        )}
        {subtitleStatus === 'DONE' && (
          <div className="text-success d-flex align-items-center justify-content-center gap-2">
            <CheckCircle size={20} />
            <span className="fw-medium">Đã hoàn thành! Bạn có thể xem và sửa phụ đề bên phải.</span>
          </div>
        )}
        {subtitleStatus === 'ERROR' && (
          <div className="text-danger d-flex align-items-center justify-content-center gap-2">
            <AlertCircle size={20} />
            <span className="fw-medium">Lỗi trong quá trình xử lý AI.</span>
          </div>
        )}
      </div>
    </div>
  )
}
