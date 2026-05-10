import React from 'react'
import { Link } from 'react-router-dom'
import { AdminSectionCard, SimpleTable, Badge, Pagination } from '../../../components/console/AdminUi'

export function ReadingArticleTable({ 
  articlesPagination, 
  filterDifficulty, setFilterDifficulty,
  filterStatus, setFilterStatus,
  filterTopicId, setFilterTopicId,
  searchTerm, setSearchTerm,
  topicRows
}) {
  return (
    <AdminSectionCard
      title="Kho bài đọc"
      description="Theo dõi trạng thái biên tập, độ khó và mức độ phủ từ nổi bật của từng bài."
      actions={
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm" style={{ width: '150px' }} value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
            <option value="">Tất cả độ khó</option>
            {['Dễ', 'Trung bình', 'Khó'].map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
          <select className="form-select form-select-sm" style={{ width: '150px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="Đã xuất bản">Đã xuất bản</option>
            <option value="Chờ biên tập">Chờ biên tập</option>
            <option value="Nháp">Nháp</option>
          </select>
          <select className="form-select form-select-sm" style={{ width: '150px' }} value={filterTopicId} onChange={(e) => setFilterTopicId(e.target.value)}>
            <option value="">Tất cả chủ đề</option>
            {topicRows.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="input-group input-group-sm" style={{ width: '200px' }}>
            <span className="input-group-text bg-light border-end-0"><i className="iconoir-search"></i></span>
            <input type="text" className="form-control border-start-0" placeholder="Tìm tiêu đề bài báo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      }
    >
      <SimpleTable
        columns={[
          {
            key: 'articleImage',
            label: 'Ảnh',
            render: (row) => (
              <img
                src={row.articleImage || 'https://via.placeholder.com/40'}
                alt={row.title}
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
              />
            )
          },
          { key: 'title', label: 'Tiêu đề' },
          { key: 'topic', label: 'Chủ đề' },
          { key: 'difficulty', label: 'Độ khó' },
          { key: 'views', label: 'Lượt đọc', render: (row) => (row.views ?? 0).toLocaleString() },
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
              <div className="d-flex gap-2 flex-nowrap text-nowrap">
                <Link to={`/admin/readings/${row.id}`} className="btn btn-sm btn-soft-info">Chi tiết</Link>
                <Link to={`/admin/readings/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                <Link to={`/admin/readings/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
              </div>
            ),
          },
        ]}
        rows={articlesPagination.paginatedData}
      />
      <Pagination
        currentPage={articlesPagination.currentPage}
        totalPages={articlesPagination.totalPages}
        onPageChange={articlesPagination.handlePageChange}
      />
    </AdminSectionCard>
  )
}
