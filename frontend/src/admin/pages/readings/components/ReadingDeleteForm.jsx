import React from 'react'
import { Link } from 'react-router-dom'
import { AdminSectionCard } from '../../../components/console/AdminUi'

export function ReadingDeleteForm({ title, id, onDelete }) {
  return (
    <div className="row g-3">
      <div className="col-12">
        <AdminSectionCard title="Xóa bài đọc">
          <div className="alert alert-danger">
            Bạn đang chuẩn bị xóa bài đọc <strong>{title || id}</strong>.
            <br /><br />
            - <strong>Xóa tạm thời:</strong> Bài báo sẽ được chuyển về trạng thái "Nháp" và ẩn khỏi website, nhưng vẫn được lưu lại trong danh sách biên tập.
            <br />
            - <strong>Xóa vĩnh viễn:</strong> Toàn bộ dữ liệu của bài báo này sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống.
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-warning" onClick={() => onDelete(false)}>Xóa tạm thời</button>
            <button className="btn btn-danger" onClick={() => onDelete(true)}>Xóa vĩnh viễn</button>
            <Link to="/admin/readings" className="btn btn-outline-secondary ms-2">Hủy</Link>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  )
}
