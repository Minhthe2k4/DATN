import React from 'react'
import { Link } from 'react-router-dom'

export function DeleteConfirmation({ currentRow, id, onSubmit }) {
  return (
    <div>
      <div className="alert alert-danger" role="alert">
        Bạn chuẩn bị xóa từ vựng <strong>{currentRow?.word}</strong> (ID: {id}).
        <br /><br />
        - <strong>Xóa tạm thời:</strong> Từ vựng sẽ được chuyển sang trạng thái "Từ chối" và ẩn khỏi các bài học, nhưng dữ liệu vẫn được giữ lại để đối soát.
        <br />
        - <strong>Xóa vĩnh viễn:</strong> Toàn bộ thông tin về từ vựng này sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống.
      </div>
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-warning" onClick={() => onSubmit(false)}>Xóa tạm thời</button>
        <button type="button" className="btn btn-danger" onClick={() => onSubmit(true)}>Xóa vĩnh viễn</button>
        <Link to="/admin/vocabulary" className="btn btn-outline-secondary">Hủy</Link>
      </div>
    </div>
  )
}
