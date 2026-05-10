import React from 'react'
import { Link } from 'react-router-dom'
import { SimpleTable, Pagination, Badge } from '../../../components/console/AdminUi'
import { Eye, Edit, Trash2, Star } from 'lucide-react'

export function LessonTable({ pagination, topicRows }) {
  return (
    <>
      <SimpleTable
        columns={[
          {
            key: 'lessonImage',
            label: 'Ảnh',
            render: (row) => (
              <img
                src={row.lessonImage || 'https://via.placeholder.com/40'}
                alt={row.name}
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
              />
            )
          },
          {
            key: 'name',
            label: 'Tên bài',
            render: (row) => <span className="fw-bold">{row.name}</span>
          },
          {
            key: 'topic',
            label: 'Chủ đề',
            render: (row) => {
              const topicName = topicRows.find((t) => t.id === row.topic_id)?.name || '...'
              return topicName
            },
          },
          { key: 'difficulty', label: 'Độ khó' },
          {
            key: 'isPremium',
            label: 'Loại',
            render: (row) => row.isPremium ? (
              <Badge tone="info">
                <Star size={12} className="me-1" /> Premium
              </Badge>
            ) : (
              <Badge tone="neutral">Free</Badge>
            )
          },
          {
            key: 'status',
            label: 'Trạng thái',
            render: (row) => <Badge tone={row.status === 'Đang mở' ? 'success' : 'warning'}>{row.status}</Badge>,
          },
          {
            key: 'actions',
            label: 'Hành động',
            render: (row) => (
              <div className="d-flex flex-wrap gap-2">
                <Link to={`/admin/lessons/${row.id}`} className="btn btn-sm btn-soft-info d-flex align-items-center gap-1">
                  <Eye size={14} /> Chi tiết
                </Link>
                <Link to={`/admin/lessons/${row.id}/edit`} className="btn btn-sm btn-soft-primary d-flex align-items-center gap-1">
                  <Edit size={14} /> Sửa
                </Link>
                <Link to={`/admin/lessons/${row.id}/delete`} className="btn btn-sm btn-soft-danger d-flex align-items-center gap-1">
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
