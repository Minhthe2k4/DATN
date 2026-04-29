import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { readingArticles, topics } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, Badge, SimpleTable, StatGrid, Pagination } from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function normalizeArticleRow(row) {
  const parsedWordsHighlighted = Number.parseInt(row.wordsHighlighted ?? row.wordHighlighted ?? 0, 10)
  return {
    id: row.id,
    title: row.title ?? '',
    topicId: row.topicId ?? null,
    topic: row.topic ?? row.topicName ?? 'Chưa gán chủ đề',
    difficulty: row.difficulty ?? 'Trung bình',
    content: row.content ?? '',
    articleImage: row.articleImage ?? row.article_image ?? '',
    createdAt: row.createdAt ?? row.created_at ?? row.create_at ?? '',
    wordsHighlighted: Number.isNaN(parsedWordsHighlighted) ? 0 : Math.max(parsedWordsHighlighted, 0),
    sourceUrl: row.sourceUrl ?? row.source ?? '',
    status: row.status ?? 'Chờ biên tập',
  }
}

function normalizeTopicRow(row) {
  const normalizedStatus = typeof row.status === 'boolean'
    ? (row.status ? 'Hoạt động' : 'Tạm dừng')
    : (row.status ?? 'Hoạt động')

  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    status: normalizedStatus,
    articleTopicImage: row.articleTopicImage ?? row.article_topic_image ?? '',
    articleCount: row.articleCount ?? 0,
    createdAt: row.createdAt ?? '',
    updatedAt: row.updatedAt ?? '',
    deletedAt: row.deletedAt ?? null
  }
}

export function ReadingManagement() {
  const [articles, setArticles] = useState(readingArticles)
  const [topicRows, setTopicRows] = useState(topics)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [filterTopicId, setFilterTopicId] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [searchTopicTerm, setSearchTopicTerm] = useState('')
  const [filterTopicStatus, setFilterTopicStatus] = useState('')

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTopic = !filterTopicId || String(article.topicId) === String(filterTopicId)
      const matchesDifficulty = !filterDifficulty || article.difficulty === filterDifficulty
      const matchesStatus = !filterStatus || article.status === filterStatus
      return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus
    })
  }, [articles, searchTerm, filterTopicId, filterDifficulty, filterStatus])

  const filteredTopics = useMemo(() => {
    return topicRows.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchTopicTerm.toLowerCase())
      const matchesStatus = !filterTopicStatus || t.status === filterTopicStatus
      return matchesSearch && matchesStatus
    })
  }, [topicRows, searchTopicTerm, filterTopicStatus])

  const articlesPagination = usePagination(filteredArticles, 10)
  const topicsPagination = usePagination(filteredTopics, 10)

  useEffect(() => {
    let disposed = false
    async function loadData() {
      try {
        const [articleResponse, topicResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/readings`),
          fetch(`${API_BASE_URL}/api/admin/reading-topics`),
        ])
        if (!articleResponse.ok || !topicResponse.ok) throw new Error('Cannot fetch reading data')
        const [articlePayload, topicPayload] = await Promise.all([articleResponse.json(), topicResponse.json()])
        if (disposed) return
        setArticles(Array.isArray(articlePayload) ? articlePayload.map(normalizeArticleRow) : readingArticles)
        setTopicRows(Array.isArray(topicPayload) ? topicPayload.map(normalizeTopicRow) : topics)
        setLoadError('')
      } catch {
        if (disposed) return
        setArticles(readingArticles)
        setTopicRows(topics)
        setLoadError('Không thể tải dữ liệu bài đọc từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }
    loadData()
    return () => { disposed = true }
  }, [])

  const stats = [
    { label: 'Bài đọc hiện có', value: articles.length.toString(), meta: 'Phục vụ tính năng học từ qua đọc báo', icon: 'iconoir-journal-page' },
    { label: 'Đã xuất bản', value: articles.filter((a) => a.status === 'Đã xuất bản').length.toString(), meta: 'Đang xuất hiện ngoài frontend', icon: 'iconoir-check-circle' },
    { label: 'Chờ biên tập', value: articles.filter((a) => a.status === 'Chờ biên tập').length.toString(), meta: 'Cần rà soát chủ đề và độ khó', icon: 'iconoir-edit-pencil' },
    { label: 'Bản nháp', value: articles.filter((a) => a.status === 'Nháp').length.toString(), meta: 'Nội dung chưa sẵn sàng công bố', icon: 'iconoir-page-search' },
  ]

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Reading Content"
          title="Quản lý bài đọc"
          description="Quản lý vòng đời bài đọc từ biên tập, phân loại đến xuất bản cho người học cuối."
          actions={
            <>
              <Link to="/admin/reading-topics/new" className="btn btn-outline-primary">Thêm chủ đề</Link>
              <Link to="/admin/readings/new" className="btn btn-primary">Thêm bài báo mới</Link>
            </>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu bài đọc từ backend...</div> : null}
        {loadError ? <div className="alert alert-warning border">{loadError}</div> : null}

        <StatGrid items={stats} />

        <div className="row g-3 mt-1">
          <div className="col-12">
            <AdminSectionCard
              title="Kho bài đọc"
              description="Theo dõi trạng thái biên tập, độ khó và mức độ phủ từ nổi bật của từng bài."
              actions={
                <div className="d-flex gap-2">
                  <select className="form-select form-select-sm" style={{ width: '150px' }} value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
                    <option value="">Tất cả độ khó</option>
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Nâng cao">Nâng cao</option>
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
                  { key: 'wordsHighlighted', label: 'Từ nổi bật' },
                  { key: 'status', label: 'Trạng thái', render: (row) => <Badge tone={row.status === 'Đã xuất bản' ? 'success' : row.status === 'Chờ biên tập' ? 'warning' : 'neutral'}>{row.status}</Badge> },
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
          </div>

          <div className="col-12">
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
          </div>
        </div>
      </div>
    </div>
  )
}
