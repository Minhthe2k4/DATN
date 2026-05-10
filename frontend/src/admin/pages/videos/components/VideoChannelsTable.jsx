import React from 'react'
import { Link } from 'react-router-dom'
import { AdminSectionCard, SimpleTable, Pagination, Badge } from '../../../components/console/AdminUi'

export function VideoChannelsTable({
  channelsPagination,
  searchChannelTerm,
  setSearchChannelTerm
}) {
  return (
    <AdminSectionCard
      title="Kênh YouTube"
      description="Quản lý các kênh YouTube cung cấp nội dung."
      actions={
        <div className="input-group input-group-sm" style={{ width: '200px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm tên kênh..."
            value={searchChannelTerm}
            onChange={(e) => setSearchChannelTerm(e.target.value)}
          />
        </div>
      }
    >
      <SimpleTable
        columns={[
          {
            key: 'avatar',
            label: 'Ảnh',
            render: (row) => (
              <img
                src={row.avatar || 'https://via.placeholder.com/40'}
                alt={row.name}
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
              />
            )
          },
          { key: 'name', label: 'Tên kênh' },
          { key: 'handle', label: 'Handle' },
          {
            key: 'subscriberCount',
            label: 'Subscribers',
            render: (row) => row.subscriberCount ? row.subscriberCount.toLocaleString() : '0'
          },
          { key: 'videoCount', label: 'Số video' },
          { key: 'status', label: 'Trạng thái', render: (row) => <Badge tone={row.status === 'Hoạt động' ? 'success' : 'neutral'}>{row.status}</Badge> },
          {
            key: 'actions',
            label: 'Hành động',
            render: (row) => (
              <div className="d-flex flex-wrap gap-2 flex-nowrap text-nowrap">
                <Link to={`/admin/video-channels/${row.id}`} className="btn btn-sm btn-soft-info">Chi tiết</Link>
                <Link to={`/admin/video-channels/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                <Link to={`/admin/video-channels/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
              </div>
            ),
          },
        ]}
        rows={channelsPagination.paginatedData}
      />
      <Pagination
        currentPage={channelsPagination.currentPage}
        totalPages={channelsPagination.totalPages}
        onPageChange={channelsPagination.handlePageChange}
      />
    </AdminSectionCard>
  )
}
