import React from 'react'
import { Link } from 'react-router-dom'
import { AdminSectionCard, SimpleTable, Pagination, Badge } from '../../../components/console/AdminUi'

export function VideosListTable({
  videosPagination,
  filterDifficulty,
  setFilterDifficulty,
  filterStatus,
  setFilterStatus,
  filterChannelId,
  setFilterChannelId,
  searchTerm,
  setSearchTerm,
  channels
}) {
  return (
    <AdminSectionCard
      title="Danh sách video"
      description="Quản lý tất cả video trong hệ thống."
      actions={
        <div className="d-flex flex-wrap gap-2">
          <select
            className="form-select form-select-sm"
            style={{ width: '150px' }}
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="">Độ khó (Tất cả)</option>
            {['Dễ', 'Trung bình', 'Khó'].map(lv => (
              <option key={lv} value={lv}>{lv}</option>
            ))}
          </select>
          <select
            className="form-select form-select-sm"
            style={{ width: '150px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Trạng thái (Tất cả)</option>
            <option value="Đã xuất bản">Đã xuất bản</option>
            <option value="Chờ biên tập">Chờ biên tập</option>
            <option value="Nháp">Nháp</option>
          </select>
          <select
            className="form-select form-select-sm"
            style={{ width: '180px' }}
            value={filterChannelId}
            onChange={(e) => setFilterChannelId(e.target.value)}
          >
            <option value="">Kênh (Tất cả)</option>
            {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="input-group input-group-sm" style={{ width: '250px' }}>
            <span className="input-group-text bg-light border-end-0"><i className="iconoir-search"></i></span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Tìm tiêu đề video..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      }
    >
      <SimpleTable
        columns={[
          {
            key: 'thumbnail',
            label: 'Ảnh',
            render: (row) => (
              <img
                src={row.thumbnail || 'https://via.placeholder.com/40'}
                alt={row.title}
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
              />
            )
          },
          { key: 'title', label: 'Tiêu đề video' },
          { key: 'channelName', label: 'Kênh' },
          { key: 'views', label: 'Lượt xem', render: (row) => (row.views ?? 0).toLocaleString() },
          {
            key: 'status',
            label: 'Trạng thái',
            render: (row) => (
              <Badge tone={row.status === 'Đã xuất bản' ? 'success' : row.status === 'Chờ biên tập' ? 'warning' : 'neutral'}>
                {row.status}
              </Badge>
            )
          },
          {
            key: 'actions',
            label: 'Hành động',
            render: (row) => (
              <div className="d-flex flex-wrap gap-2 flex-nowrap text-nowrap">
                <Link to={`/admin/videos/${row.id}`} className="btn btn-sm btn-soft-info">Chi tiết</Link>
                <Link to={`/admin/videos/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                <Link to={`/admin/videos/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
              </div>
            ),
          },
        ]}
        rows={videosPagination.paginatedData}
      />
      <Pagination
        currentPage={videosPagination.currentPage}
        totalPages={videosPagination.totalPages}
        onPageChange={videosPagination.handlePageChange}
      />
    </AdminSectionCard>
  )
}
