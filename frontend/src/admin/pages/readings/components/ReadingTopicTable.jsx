import React from 'react'
import { Link } from 'react-router-dom'
import { AdminSectionCard, SimpleTable, Badge, Pagination } from '../../../components/console/AdminUi'

// Component hiển thị bảng danh sách các chủ đề bài báo (Article Topics).
// Cho phép Admin lọc theo trạng thái, tìm kiếm và quản lý vòng đời của chủ đề.
export function ReadingTopicTable({ 
  topicsPagination, // Object phân trang chứa dữ liệu đã lọc
  filterTopicStatus, setFilterTopicStatus, // State lọc theo trạng thái
  searchTopicTerm, setSearchTopicTerm // State tìm kiếm theo tên
}) {
  return (
    <AdminSectionCard
      title="Article topics"
      description="Quản lý danh sách chủ đề dùng để phân loại bài đọc."
      actions={
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm" style={{ width: '150px' }} value={filterTopicStatus} onChange={(e) => setFilterTopicStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="Hoạt động">Hoạt động</option>
            <option value="Tạm dừng">Tạm dừng</option>
          </select>
          <div className="input-group input-group-sm" style={{ width: '180px' }}>
            <input type="text" className="form-control" placeholder="Tìm tên topic..." value={searchTopicTerm} onChange={(e) => setSearchTopicTerm(e.target.value)} />
          </div>
        </div>
      }
    >
      <SimpleTable
        columns={[
          {
            key: 'articleTopicImage',
            label: 'Ảnh',
            render: (row) => (
              <img
                src={row.articleTopicImage || 'https://via.placeholder.com/40'}
                alt={row.name}
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
              />
            )
          },
          { key: 'name', label: 'Tên topic' },
          { key: 'description', label: 'Mô tả' },
          { key: 'articleCount', label: 'Bài đọc' },
          { key: 'status', label: 'Trạng thái', render: (row) => <Badge tone={row.status === 'Hoạt động' ? 'success' : 'warning'}>{row.status}</Badge> },
          {
            key: 'actions',
            label: 'Hành động',
            render: (row) => (
              <div className="d-flex flex-wrap gap-2">
                <Link to={`/admin/reading-topics/${row.id}`} className="btn btn-sm btn-soft-info">Chi tiết</Link>
                <Link to={`/admin/reading-topics/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                <Link to={`/admin/reading-topics/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
              </div>
            ),
          },
        ]}
        rows={topicsPagination.paginatedData}
      />
      <Pagination
        currentPage={topicsPagination.currentPage}
        totalPages={topicsPagination.totalPages}
        onPageChange={topicsPagination.handlePageChange}
      />
    </AdminSectionCard>
  )
}
