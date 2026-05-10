import React from 'react'
import { Link } from 'react-router-dom'

export function TopicDeleteConfirmation({ topicName, topicId, onConfirm }) {
  return (
    <div>
      <div className="alert alert-danger">
        Bạn đang chuẩn bị xóa chủ đề <strong>{topicName || topicId}</strong>.
        <br /><br />
        - <strong>Xóa tạm thời:</strong> Chủ đề sẽ được chuyển sang trạng thái "Tạm dừng" và ẩn khỏi website của người học, nhưng dữ liệu vẫn được giữ lại để quản lý.
        <br />
        - <strong>Xóa vĩnh viễn:</strong> Toàn bộ thông tin về chủ đề này sẽ bị xóa bỏ hoàn toàn khỏi hệ thống.
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-warning" onClick={() => onConfirm(false)}>Xóa tạm thời</button>
        <button className="btn btn-danger" onClick={() => onConfirm(true)}>Xóa vĩnh viễn</button>
        <Link to="/admin/topics" className="btn btn-outline-secondary">Hủy</Link>
      </div>
    </div>
  )
}
