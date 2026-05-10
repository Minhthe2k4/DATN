import React from 'react'

export function UserDeleteConfirmation({ draft, handleDelete, onCancel }) {
  return (
    <div className="delete-confirmation">
      <div className="alert alert-danger mb-4">
        Bạn đang chuẩn bị xóa tài khoản <strong>{draft.username}</strong> ({draft.email}).
        <br /><br />
        - <strong>Xóa tạm thời:</strong> Tài khoản sẽ bị chuyển sang trạng thái "Bị khóa" và ẩn khỏi các danh sách hoạt động, nhưng dữ liệu vẫn được lưu trữ để đối soát.
        <br />
        - <strong>Xóa vĩnh viễn:</strong> Gỡ bỏ hoàn toàn tài khoản khỏi hệ thống. Toàn bộ thông tin và tiến trình học tập sẽ mất vĩnh viễn.
      </div>
      <div className="d-flex gap-3">
        <button className="btn btn-warning px-4" onClick={() => handleDelete(false)}>Xóa tạm thời</button>
        <button className="btn btn-danger px-4" onClick={() => handleDelete(true)}>Xóa vĩnh viễn</button>
        <button className="btn btn-outline-secondary px-4" onClick={onCancel}>Hủy</button>
      </div>
    </div>
  )
}
