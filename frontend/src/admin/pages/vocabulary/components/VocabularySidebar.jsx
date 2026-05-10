import React from 'react'
import { AdminSectionCard } from '../../../components/console/AdminUi'

export function VocabularySidebar({ currentRow, lessonName }) {
  return (
    <>
      <AdminSectionCard title="Hướng dẫn" description="Quy chuẩn nhập liệu">
        <ul className="mb-0 ps-3 d-grid gap-1 small">
          <li><strong>Từ:</strong> chữ thường (lowercase)</li>
          <li><strong>Phiên âm:</strong> ký hiệu IPA /.../ </li>
          <li><strong>Loại từ:</strong> noun, verb, adj...</li>
          <li><strong>Định nghĩa:</strong> ngắn, dễ hiểu</li>
          <li><strong>Ví dụ:</strong> câu hoàn chỉnh</li>
          <li><strong>Trạng thái:</strong> Nháp → Chờ → Duyệt</li>
        </ul>
      </AdminSectionCard>

      {currentRow && (
        <AdminSectionCard title="Thông tin hiện tại" className="mt-3">
          <div className="d-grid gap-2 small">
            <div>
              <strong>ID:</strong>
              <br />
              <code>{currentRow.id}</code>
            </div>
            <div>
              <strong>Bài học:</strong>
              <br />
              <span>{lessonName || currentRow.lesson_id || currentRow.topic_id}</span>
            </div>
            <div>
              <strong>Trạng thái:</strong>
              <br />
              <span className="badge bg-info">{currentRow.status}</span>
            </div>
          </div>
        </AdminSectionCard>
      )}
    </>
  )
}
