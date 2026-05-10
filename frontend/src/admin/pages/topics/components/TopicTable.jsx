import React from 'react'
import { Link } from 'react-router-dom'
import { AdminSectionCard, SimpleTable, Badge, Pagination } from '../../../components/console/AdminUi'

export function TopicTable({
  pagination,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  filteredCount
}) {
  return (
    <div className="row g-3 mt-1">
      <div className="col-12">
        <AdminSectionCard
          title="Danh sách chủ đề"
          actions={<span className="badge bg-light text-primary border">{filteredCount} chủ đề</span>}
        >
          <div className="mb-3">
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="iconoir-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Tìm kiếm chủ đề..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">Tất cả trạng thái</option>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Tạm dừng">Tạm dừng</option>
                </select>
              </div>
            </div>
          </div>

          <SimpleTable
            columns={[
              {
                key: 'topicImage',
                label: 'Ảnh',
                render: (row) => (
                  <img
                    src={row.topicImage || 'https://via.placeholder.com/40'}
                    alt={row.name}
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                )
              },
              {
                key: 'name',
                label: 'Tên chủ đề',
                render: (row) => <span className="fw-bold">{row.name}</span>
              },
              { key: 'lessons', label: 'Bài học' },
              {
                key: 'status',
                label: 'Trạng thái',
                render: (row) => <Badge tone={row.status === 'Hoạt động' ? 'success' : 'warning'}>{row.status}</Badge>,
              },
              {
                key: 'actions',
                label: 'Hành động',
                render: (row) => (
                  <div className="d-flex flex-wrap gap-2">
                    <Link to={`/admin/topics/${row.id}`} className="btn btn-sm btn-soft-info">Xem chi tiết</Link>
                    <Link to={`/admin/topics/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                    <Link to={`/admin/topics/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
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
        </AdminSectionCard>
      </div>
    </div>
  )
}
