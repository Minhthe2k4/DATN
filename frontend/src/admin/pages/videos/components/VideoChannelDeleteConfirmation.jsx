import React from 'react'

export function VideoChannelDeleteConfirmation({ draft, handleDelete, onCancel }) {
  return (
    <div className="delete-confirmation">
      <div className="alert alert-danger mb-4">
        Bạn đang chuẩn bị xóa kênh <strong>{draft.name}</strong>.
        <br /><br />
        - <strong>Xóa tạm thời (Tạm dừng):</strong> Kênh sẽ bị ẩn khỏi Website, nhưng vẫn được lưu trữ trong hệ thống quản lý.
        <br />
        - <strong>Xóa vĩnh viễn:</strong> Gỡ bỏ hoàn toàn kênh khỏi hệ thống.
      </div>
      <div className="d-flex gap-3">
        <button className="btn btn-warning px-4" onClick={() => handleDelete(false)}>Xóa tạm thời</button>
        <button className="btn btn-danger px-4" onClick={() => handleDelete(true)}>Xóa vĩnh viễn</button>
        <button className="btn btn-outline-secondary px-4" onClick={onCancel}>Hủy</button>
      </div>
    </div>
  )
}
