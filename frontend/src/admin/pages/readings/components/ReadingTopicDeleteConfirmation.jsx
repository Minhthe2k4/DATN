import React from 'react'

export function ReadingTopicDeleteConfirmation({ name, onDelete, onCancel, error, success }) {
  return (
    <div className="delete-confirmation">
      <div className="alert alert-danger mb-4">
         Bạn đang chuẩn bị xóa chủ đề <strong>{name}</strong>.
        <br /><br />
        - <strong>Xóa tạm thời (Tạm dừng):</strong> Chủ đề này sẽ bị ẩn khỏi Website, nhưng dữ liệu vẫn được lưu trữ để quản lý.
        <br />
        - <strong>Xóa vĩnh viễn:</strong> Gỡ bỏ hoàn toàn chủ đề khỏi hệ thống.
      </div>
      <div className="d-flex gap-3">
        <button className="btn btn-warning px-4" onClick={() => onDelete(false)}>Tạm dừng</button>
        <button className="btn btn-danger px-4" onClick={() => onDelete(true)}>Xóa vĩnh viễn</button>
        <button className="btn btn-outline-secondary px-4" onClick={onCancel}>Hủy</button>
      </div>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {success && <div className="alert alert-success mt-3">{success}</div>}
    </div>
  )
}
