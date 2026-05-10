import React from 'react'
import { Link } from 'react-router-dom'
import { AdminSectionCard, FilterTabs, SimpleTable, Badge, Pagination } from '../../components/console/AdminUi'

export function UserTable({ 
  pagination, 
  activeFilter, 
  setActiveFilter 
}) {
  return (
    <AdminSectionCard
      title="Danh sách người dùng"
      description="Tra cứu và xử lý tài khoản theo trạng thái hoạt động."
      actions={<FilterTabs items={['Tất cả', 'Hoạt động', 'Bị khóa']} active={activeFilter} onChange={setActiveFilter} />}
    >
      <SimpleTable
        columns={[
          { 
            key: 'avatar', 
            label: 'Ảnh',
            render: (row) => (
              <img 
                src={row.avatar || 'https://via.placeholder.com/32'} 
                alt="Avatar" 
                className="rounded-circle border" 
                style={{ width: '32px', height: '32px', objectFit: 'cover' }} 
              />
            )
          },
          { key: 'username', label: 'Username' },
          { key: 'email', label: 'Email' },
          { key: 'fullname', label: 'Họ tên' },
          { key: 'createdAt', label: 'Ngày tạo' },
          {
            key: 'role',
            label: 'Vai trò',
            render: (row) => <Badge tone={row.role === 'ADMIN' ? 'danger' : 'info'}>{row.role}</Badge>,
          },
          {
            key: 'status',
            label: 'Trạng thái',
            render: (row) => <Badge tone={row.isActive ? 'success' : 'danger'}>{row.status}</Badge>,
          },
          {
            key: 'actions',
            label: 'Hành động',
            render: (row) => (
              <div className="d-flex flex-nowrap gap-2">
                <Link to={`/admin/users/${row.id}`} className="btn btn-sm btn-soft-info">Chi tiết</Link>
                <Link to={`/admin/users/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                <Link to={`/admin/users/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
              </div>
            ),
          },
        ]}
        rows={pagination.paginatedData}
        emptyMessage="Không tìm thấy người dùng phù hợp."
      />
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.handlePageChange}
      />
    </AdminSectionCard>
  )
}
