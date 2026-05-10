import { Link } from 'react-router-dom'
import { SimpleTable, Pagination, Badge } from '../../../components/console/AdminUi'
import { Eye, Edit, Trash2 } from 'lucide-react'

export function VocabularyTable({
  pagination,
  lessonRows,
  resolveLessonId,
  normalizeStatus
}) {
  return (
    <>
      <SimpleTable
        columns={[
          { key: 'word', label: 'Từ' },
          { key: 'pronunciation', label: 'Phiên âm' },
          { key: 'type_of_word', label: 'Từ loại' },
          { key: 'meaning_vi', label: 'Nghĩa Việt' },
          {
            key: 'lesson',
            label: 'Bài học',
            render: (row) => {
              const lessonId = resolveLessonId(row, lessonRows)
              const lessonName = lessonRows.find((lesson) => String(lesson.id) === String(lessonId))?.name || 'Chưa gán bài học'
              return lessonName
            },
          },
          { key: 'level', label: 'Mức độ' },
          {
            key: 'status',
            label: 'Trạng thái',
            render: (row) => (
              <Badge tone={normalizeStatus(row.status) === 'Đã duyệt' ? 'success' : 'warning'}>
                {normalizeStatus(row.status)}
              </Badge>
            ),
          },
          {
            key: 'actions',
            label: 'Hành động',
            render: (row) => (
              <div className="d-flex flex-wrap gap-2">
                <Link to={`/admin/vocabulary/${row.id}`} className="btn btn-sm btn-soft-info d-flex align-items-center gap-1">
                  <Eye size={14} /> Chi tiết
                </Link>
                <Link to={`/admin/vocabulary/${row.id}/edit`} className="btn btn-sm btn-soft-primary d-flex align-items-center gap-1">
                  <Edit size={14} /> Sửa
                </Link>
                <Link to={`/admin/vocabulary/${row.id}/delete`} className="btn btn-sm btn-soft-danger d-flex align-items-center gap-1">
                  <Trash2 size={14} /> Xóa
                </Link>
              </div>
            ),
          },
        ]}
        rows={pagination.paginatedData}
      />
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.handlePageChange}
      />
    </>
  )
}
