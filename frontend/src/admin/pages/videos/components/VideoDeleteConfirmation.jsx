import React from 'react'
import { Link } from 'react-router-dom'

export function VideoDeleteConfirmation({ videoDraft, id, handleDelete }) {
  return (
    <div className="card-body">
      <div className="alert alert-danger">
        Bạn đang chuẩn bị xóa video <strong>{videoDraft.title || id}</strong>.
        <br /><br />
        - <strong>Xóa tạm thời:</strong> Video sẽ được chuyển sang trạng thái "Nháp" và ẩn khỏi website, nhưng vẫn được lưu lại để biên tập.
        <br />
        - <strong>Xóa vĩnh viễn:</strong> Toàn bộ dữ liệu của video này sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống.
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-warning" onClick={() => handleDelete(false)}>Xóa tạm thời</button>
        <button className="btn btn-danger" onClick={() => handleDelete(true)}>Xóa vĩnh viễn</button>
        <Link to="/admin/videos" className="btn btn-outline-secondary ms-2">Hủy</Link>
      </div>
    </div>
  )
}
