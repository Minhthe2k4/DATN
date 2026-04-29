import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { topics as topicSeed } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, Badge, SimpleTable, StatGrid, Pagination } from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function normalizeTopicRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    lessons: row.lessons ?? 0,
    status: row.status ?? 'Hoạt động',
    topicImage: row.topicImage ?? '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  }
}

export function TopicManagement() {
  const [topicRows, setTopicRows] = useState(topicSeed)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    let isDisposed = false

    async function loadTopics() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/topics`)
        if (!response.ok) {
          throw new Error(`Cannot fetch topics: ${response.status}`)
        }

        const payload = await response.json()
        if (isDisposed) {
          return
        }

        if (Array.isArray(payload)) {
          setTopicRows(payload.map(normalizeTopicRow))
        }
        setLoadError('')
      } catch {
        if (isDisposed) {
          return
        }

        setTopicRows(topicSeed)
        setLoadError('Không thể tải danh sách chủ đề từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!isDisposed) {
          setIsLoading(false)
        }
      }
    }

    loadTopics()

    return () => {
      isDisposed = true
    }
  }, [])

  const stats = useMemo(() => [
    {
      label: 'Tổng số chủ đề',
      value: topicRows.length.toString(),
      meta: 'Có thể mở rộng linh hoạt theo nội dung mới',
      icon: 'iconoir-folder',
    },
    {
      label: 'Đang hoạt động',
      value: topicRows.filter((topic) => topic.status === 'Hoạt động').length.toString(),
      meta: 'Sẵn sàng gán cho bài học và bài đọc',
      icon: 'iconoir-check-circle',
    },
    {
      label: 'Tạm dừng',
      value: topicRows.filter((topic) => topic.status !== 'Hoạt động').length.toString(),
      meta: 'Cần rà soát trước khi kích hoạt lại',
      icon: 'iconoir-pause-window',
    },
    {
      label: 'Số bài học',
      value: topicRows.reduce((sum, topic) => sum + (topic.lessons || 0), 0).toLocaleString('en-US'),
      meta: 'Tổng số bài học đã gán cho tất cả chủ đề',
      icon: 'iconoir-book',
    },
  ], [topicRows])

  const filteredTopics = useMemo(() => {
    let result = topicRows

    if (statusFilter !== 'All') {
      result = result.filter(topic => topic.status === statusFilter)
    }

    const term = searchTerm.toLowerCase().trim()
    if (term) {
      result = result.filter((topic) =>
        topic.name.toLowerCase().includes(term) ||
        topic.description.toLowerCase().includes(term)
      )
    }

    return result
  }, [topicRows, searchTerm, statusFilter])

  const pagination = usePagination(filteredTopics, 10)

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Content Management"
          title="Quản lý chủ đề"
          description="Tổ chức hệ thống chủ đề để đồng bộ việc quản lý bài học và tư liệu học tập."
          actions={
            <>
              <Link to="/admin/topics/new" className="btn btn-primary">Thêm chủ đề</Link>
            </>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
        {loadError ? <div className="alert alert-warning border">{loadError}</div> : null}

        <StatGrid items={stats} />

        <div className="row g-3 mt-1">
          <div className="col-12">
            <AdminSectionCard
              title="Danh sách chủ đề"
              actions={<span className="badge bg-light text-primary border">{filteredTopics.length} chủ đề</span>}
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
      </div>
    </div>
  )
}