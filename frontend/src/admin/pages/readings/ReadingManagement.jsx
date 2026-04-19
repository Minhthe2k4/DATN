import { useEffect, useMemo, useState } from 'react'
import { readingArticles, topics } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, Badge, SimpleTable, StatGrid } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const DIFFICULTY_OPTIONS = ['Cơ bản', 'Trung bình', 'Nâng cao']
const ARTICLE_STATUS_OPTIONS = ['Chờ biên tập', 'Đã xuất bản', 'Nháp']

function emptyDraft() {
  return {
    title: '',
    topicId: '',
    difficulty: 'Trung bình',
    content: '',
    articleImage: '',
    createdAt: '',
    wordsHighlighted: 0,
    sourceUrl: '',
    status: 'Chờ biên tập',
  }
}

function emptyTopicDraft() {
  return { name: '', description: '', defaultDifficulty: 'Trung bình', status: 'Hoạt động', articleTopicImage: '' }
}

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
    defaultDifficulty: row.defaultDifficulty ?? 'Trung bình',
    status: normalizedStatus,
    articleTopicImage: row.articleTopicImage ?? row.article_topic_image ?? '',
    articleCount: row.articleCount ?? 0,
  }
}

export function ReadingManagement() {
  const [articles, setArticles] = useState(readingArticles)
  const [topicRows, setTopicRows] = useState(topics)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticleId, setEditingArticleId] = useState(null)
  const [draft, setDraft] = useState(emptyDraft())
  const [modalError, setModalError] = useState('')
  const [isCrawlingArticle, setIsCrawlingArticle] = useState(false)

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false)
  const [editingTopicId, setEditingTopicId] = useState(null)
  const [topicDraft, setTopicDraft] = useState(emptyTopicDraft())
  const [topicError, setTopicError] = useState('')

  // Nâng cấp: Tìm kiếm và Lọc
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTopicId, setFilterTopicId] = useState('')
  const [searchTopicTerm, setSearchTopicTerm] = useState('')

  // Lọc danh sách bài viết
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTopic = !filterTopicId || String(article.topicId) === String(filterTopicId)
      return matchesSearch && matchesTopic
    })
  }, [articles, searchTerm, filterTopicId])

  // Lọc danh sách topic (để hiển thị bảng topic bên dưới)
  const filteredTopics = useMemo(() => {
    return topicRows.filter((t) => t.name.toLowerCase().includes(searchTopicTerm.toLowerCase()))
  }, [topicRows, searchTopicTerm])

  useEffect(() => {
    let disposed = false

    async function loadData() {
      try {
        const [articleResponse, topicResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/readings`),
          fetch(`${API_BASE_URL}/api/admin/reading-topics`),
        ])

        if (!articleResponse.ok || !topicResponse.ok) {
          throw new Error('Cannot fetch reading data')
        }

        const [articlePayload, topicPayload] = await Promise.all([
          articleResponse.json(),
          topicResponse.json(),
        ])

        if (disposed) {
          return
        }

        setArticles(Array.isArray(articlePayload) ? articlePayload.map(normalizeArticleRow) : readingArticles)
        setTopicRows(Array.isArray(topicPayload) ? topicPayload.map(normalizeTopicRow) : topics)
        setLoadError('')
      } catch {
        if (disposed) {
          return
        }
        setArticles(readingArticles)
        setTopicRows(topics)
        setLoadError('Không thể tải dữ liệu bài đọc từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!disposed) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      disposed = true
    }
  }, [])

  const reloadData = async () => {
    const [articleResponse, topicResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/readings`),
      fetch(`${API_BASE_URL}/api/admin/reading-topics`),
    ])

    if (!articleResponse.ok || !topicResponse.ok) {
      throw new Error('Cannot refresh reading data')
    }

    const [articlePayload, topicPayload] = await Promise.all([
      articleResponse.json(),
      topicResponse.json(),
    ])

    setArticles(Array.isArray(articlePayload) ? articlePayload.map(normalizeArticleRow) : readingArticles)
    setTopicRows(Array.isArray(topicPayload) ? topicPayload.map(normalizeTopicRow) : topics)
  }

  const setField = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }))

  const openModal = () => {
    setEditingArticleId(null)
    setDraft(emptyDraft())
    setModalError('')
    setIsModalOpen(true)
  }

  const openEditArticleModal = (article) => {
    setEditingArticleId(article.id)
    setDraft({
      title: article.title,
      topicId: article.topicId || '',
      difficulty: article.difficulty || 'Trung bình',
      content: article.content || '',
      articleImage: article.articleImage || '',
      createdAt: article.createdAt ? new Date(article.createdAt).toISOString().slice(0, 16) : '',
      wordsHighlighted: Number.isFinite(article.wordsHighlighted) ? article.wordsHighlighted : 0,
      sourceUrl: article.sourceUrl || '',
      status: article.status || 'Chờ biên tập',
    })
    setModalError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setModalError('')
    setEditingArticleId(null)
    setIsCrawlingArticle(false)
    setIsModalOpen(false)
  }

  const closeTopicModal = () => {
    setTopicError('')
    setEditingTopicId(null)
    setTopicDraft(emptyTopicDraft())
    setIsTopicModalOpen(false)
  }

  const openCreateTopicModal = () => {
    setTopicError('')
    setEditingTopicId(null)
    setTopicDraft(emptyTopicDraft())
    setIsTopicModalOpen(true)
  }

  const openEditTopicModal = (topic) => {
    setTopicError('')
    setEditingTopicId(topic.id)
    setTopicDraft({
      name: topic.name,
      description: topic.description,
      defaultDifficulty: topic.defaultDifficulty,
      status: topic.status,
      articleTopicImage: topic.articleTopicImage || '',
    })
    setIsTopicModalOpen(true)
  }

  const handleTopicField = (field, value) => {
    setTopicDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveTopic = async () => {
    const normalizedName = topicDraft.name.trim()
    if (!normalizedName) {
      setTopicError('Tên chủ đề không được để trống.')
      return
    }

    const duplicated = topicRows.some(
      (topic) => topic.id !== editingTopicId && topic.name.trim().toLowerCase() === normalizedName.toLowerCase(),
    )
    if (duplicated) {
      setTopicError('Tên chủ đề đã tồn tại. Vui lòng chọn tên khác.')
      return
    }

    try {
      const payload = {
        name: normalizedName,
        description: topicDraft.description.trim() || 'Chưa có mô tả.',
        defaultDifficulty: topicDraft.defaultDifficulty,
        status: topicDraft.status,
        articleTopicImage: topicDraft.articleTopicImage.trim(),
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/reading-topics${editingTopicId ? `/${editingTopicId}` : ''}`, {
        method: editingTopicId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Cannot save topic')
      }

      await reloadData()
      setTopicError('')
      closeTopicModal()
    } catch {
      setTopicError('Lưu chủ đề thất bại. Vui lòng thử lại.')
    }
  }

  const handleDeleteTopic = async (topic) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/reading-topics/${topic.id}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) {
        throw new Error('Cannot delete topic')
      }
      await reloadData()
    } catch {
      setTopicError('Không thể xóa chủ đề này (có thể đang còn bài đọc liên kết).')
      setIsTopicModalOpen(true)
    }
  }

  const handleSaveArticle = async () => {
    if (!draft.title.trim()) {
      setModalError('Tiêu đề bài báo không được để trống.')
      return
    }
    if (!draft.topicId) {
      setModalError('Vui lòng chọn chủ đề cho bài báo.')
      return
    }
    const wordsHighlighted = Number.parseInt(draft.wordsHighlighted ?? 0, 10)
    if (Number.isNaN(wordsHighlighted) || wordsHighlighted < 0) {
      setModalError('Số từ nổi bật phải là số nguyên lớn hơn hoặc bằng 0.')
      return
    }

    try {
      const normalizedCreatedAt = editingArticleId
        ? (draft.createdAt ? new Date(draft.createdAt).toISOString() : new Date().toISOString())
        : new Date().toISOString()
      const payload = {
        title: draft.title.trim(),
        topicId: Number(draft.topicId),
        difficulty: draft.difficulty,
        content: draft.content.trim(),
        articleImage: draft.articleImage.trim(),
        createdAt: normalizedCreatedAt,
        wordsHighlighted,
        sourceUrl: draft.sourceUrl.trim() || '',
        status: draft.status || 'Chờ biên tập',
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/readings${editingArticleId ? `/${editingArticleId}` : ''}`, {
        method: editingArticleId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Cannot save article')
      }

      await reloadData()
      setModalError('')
      closeModal()
    } catch {
      setModalError('Lưu bài đọc thất bại. Vui lòng thử lại.')
    }
  }

  const handleCrawlFromSource = async () => {
    if (!draft.sourceUrl.trim()) {
      setModalError('Vui lòng nhập URL nguồn trước khi crawl nội dung.')
      return
    }

    try {
      setIsCrawlingArticle(true)
      setModalError('')

      const response = await fetch(`${API_BASE_URL}/api/admin/readings/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: draft.sourceUrl.trim() }),
      })

      if (!response.ok) {
        throw new Error('Cannot crawl article')
      }

      const payload = await response.json()
      const parsedWordsHighlighted = Number.parseInt(payload.wordsHighlighted ?? 0, 10)

      setDraft((prev) => ({
        ...prev,
        title: payload.title?.trim() || prev.title,
        content: payload.content?.trim() || prev.content,
        articleImage: payload.articleImage?.trim() || prev.articleImage,
        createdAt: payload.createdAt ? new Date(payload.createdAt).toISOString().slice(0, 16) : prev.createdAt,
        wordsHighlighted: Number.isNaN(parsedWordsHighlighted) ? prev.wordsHighlighted : Math.max(parsedWordsHighlighted, 0),
      }))
    } catch {
      setModalError('Không crawl được dữ liệu từ URL này. Vui lòng kiểm tra link hoặc thử lại.')
    } finally {
      setIsCrawlingArticle(false)
    }
  }

  const handleDeleteArticle = async (article) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/readings/${article.id}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) {
        throw new Error('Cannot delete article')
      }
      await reloadData()
    } catch {
      setModalError('Xóa bài đọc thất bại. Vui lòng thử lại.')
      setIsModalOpen(true)
    }
  }

  const stats = [
    {
      label: 'Bài đọc hiện có',
      value: articles.length.toString(),
      meta: 'Phục vụ tính năng học từ qua đọc báo',
      icon: 'iconoir-journal-page',
    },
    {
      label: 'Đã xuất bản',
      value: articles.filter((a) => a.status === 'Đã xuất bản').length.toString(),
      meta: 'Đang xuất hiện ngoài frontend',
      icon: 'iconoir-check-circle',
    },
    {
      label: 'Chờ biên tập',
      value: articles.filter((a) => a.status === 'Chờ biên tập').length.toString(),
      meta: 'Cần rà soát chủ đề và độ khó',
      icon: 'iconoir-edit-pencil',
    },
    {
      label: 'Bản nháp',
      value: articles.filter((a) => a.status === 'Nháp').length.toString(),
      meta: 'Nội dung chưa sẵn sàng công bố',
      icon: 'iconoir-page-search',
    },
  ]

  // Hàm đổi trạng thái bài đọc
  async function handleChangeStatus(articleId, newStatus) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/readings/${articleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Sau khi cập nhật trạng thái, luôn reload lại dữ liệu từ backend
        await reloadData();
      } else {
        alert('Cập nhật trạng thái thất bại');
      }
    } catch {
      alert('Lỗi kết nối server');
    }
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Reading Content"
          title="Quản lý bài đọc"
          description="Quản lý vòng đời bài đọc từ biên tập, phân loại đến xuất bản cho người học cuối."
          actions={
            <>
              <button type="button" className="btn btn-outline-primary" onClick={openCreateTopicModal}>Thêm topic</button>
              <button type="button" className="btn btn-primary" onClick={openModal}>Thêm bài báo mới</button>
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
                  <select 
                    className="form-select form-select-sm" 
                    style={{ width: '180px' }}
                    value={filterTopicId}
                    onChange={(e) => setFilterTopicId(e.target.value)}
                  >
                    <option value="">Tất cả chủ đề</option>
                    {topicRows.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <div className="input-group input-group-sm" style={{ width: '250px' }}>
                    <span className="input-group-text bg-light border-end-0">
                      <i className="iconoir-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Tìm tiêu đề bài báo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              }
            >
                <SimpleTable
                  columns={[
                    { key: 'title', label: 'Tiêu đề' },
                    { key: 'topic', label: 'Chủ đề' },
                    { key: 'difficulty', label: 'Độ khó' },
                    { key: 'wordsHighlighted', label: 'Từ nổi bật' },
                    {
                      key: 'status',
                      label: 'Trạng thái',
                      render: (row) => (
                        <Badge tone={row.status === 'Đã xuất bản' ? 'success' : row.status === 'Chờ biên tập' ? 'warning' : 'neutral'}>{row.status}</Badge>
                      ),
                    },
                    {
                      key: 'actions',
                      label: 'Hành động',
                      render: (row) => (
                        <div className="d-flex flex-wrap gap-2">
                          <button type="button" className="btn btn-sm btn-soft-primary" onClick={() => openEditArticleModal(row)}>Sửa</button>
                          <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleDeleteArticle(row)}>Xóa</button>
                        </div>
                      ),
                    },
                  ]}
                  rows={filteredArticles}
                />
            </AdminSectionCard>
          </div>
          <div className="col-12">
            <AdminSectionCard
              title="Article topics"
              description="Quản lý danh sách chủ đề dùng để phân loại bài đọc. Có thể thêm, sửa, xóa trực tiếp tại đây."
              actions={
                <div className="input-group input-group-sm" style={{ width: '200px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm tên topic..."
                    value={searchTopicTerm}
                    onChange={(e) => setSearchTopicTerm(e.target.value)}
                  />
                </div>
              }
            >
              <SimpleTable
                columns={[
                  { key: 'name', label: 'Tên topic' },
                  { key: 'description', label: 'Mô tả' },
                  { key: 'defaultDifficulty', label: 'Độ khó mặc định' },
                  {
                    key: 'articleTopicImage',
                    label: 'Ảnh topic',
                    render: (row) => row.articleTopicImage
                      ? <a href={row.articleTopicImage} target="_blank" rel="noreferrer">Xem ảnh</a>
                      : <span className="text-muted">Chưa có</span>,
                  },
                  { key: 'articleCount', label: 'Bài đọc' },
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
                        <button type="button" className="btn btn-sm btn-soft-primary" onClick={() => openEditTopicModal(row)}>Sửa</button>
                        <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => handleDeleteTopic(row)}>Xóa</button>
                      </div>
                    ),
                  },
                ]}
                rows={filteredTopics}
                emptyMessage="Chưa có topic nào cho bài đọc."
              />
            </AdminSectionCard>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content topic-bulk-modal">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title mb-1">{editingArticleId ? 'Sửa bài báo' : 'Thêm bài báo mới'}</h5>
                    <div className="topic-bulk-modal__subtitle">Bài báo mới sẽ vào hàng chờ biên tập để rà soát chủ đề và đánh dấu từ nổi bật.</div>
                  </div>
                  <button type="button" className="btn-close" aria-label="Đóng" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tiêu đề bài báo <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Ví dụ: How Remote Teams Communicate Effectively"
                      value={draft.title}
                      onChange={(e) => setField('title', e.target.value)}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Chủ đề <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={draft.topicId}
                        onChange={(e) => setField('topicId', e.target.value)}
                      >
                        <option value=""> Chọn chủ đề </option>
                        {topicRows.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Độ khó</label>
                      <select
                        className="form-select"
                        value={draft.difficulty}
                        onChange={(e) => setField('difficulty', e.target.value)}
                      >
                        {DIFFICULTY_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nội dung bài đọc</label>
                    <textarea
                      className="form-control"
                      rows={6}
                      placeholder="Nội dung sẽ được điền sau khi crawl từ URL nguồn (vẫn có thể chỉnh tay nếu cần)."
                      value={draft.content}
                      onChange={(e) => setField('content', e.target.value)}
                    ></textarea>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Ảnh bài viết <span className="text-muted fw-normal">(URL)</span></label>
                      <input
                        className="form-control"
                        type="url"
                        placeholder="https://..."
                        value={draft.articleImage}
                        onChange={(e) => setField('articleImage', e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Ngày tạo</label>
                      <div className="form-control bg-light">
                        {editingArticleId
                          ? (draft.createdAt ? new Date(draft.createdAt).toLocaleString('vi-VN') : 'Sẽ tự động gán theo thời gian thực khi lưu')
                          : 'Tự động gán theo thời gian thực khi tạo bài'}
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Số từ nổi bật</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      step="1"
                      value={draft.wordsHighlighted}
                      onChange={(e) => setField('wordsHighlighted', e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Trạng thái</label>
                    <select
                      className="form-select"
                      value={draft.status}
                      onChange={(e) => setField('status', e.target.value)}
                    >
                      {ARTICLE_STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">URL nguồn <span className="text-muted fw-normal">(tùy chọn)</span></label>
                    <div className="d-flex gap-2">
                      <input
                        className="form-control"
                        type="url"
                        placeholder="https://..."
                        value={draft.sourceUrl}
                        onChange={(e) => setField('sourceUrl', e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleCrawlFromSource}
                        disabled={isCrawlingArticle}
                      >
                        {isCrawlingArticle ? 'Đang crawl...' : 'Crawl nội dung'}
                      </button>
                    </div>
                    <small className="text-muted">Hệ thống sẽ tự điền tiêu đề, nội dung, ảnh và số từ nổi bật từ link bài báo.</small>
                  </div>
                  <div className="topic-secondary-panel">
                    <i className="iconoir-info-circle me-1"></i>
                    Bài báo sau khi thêm sẽ có trạng thái <strong>Chờ biên tập</strong>. Nội dung ưu tiên lấy từ URL nguồn bằng chức năng crawl.
                  </div>
                  {modalError ? <div className="text-danger mt-3">{modalError}</div> : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Hủy</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveArticle}>
                    {editingArticleId ? 'Lưu cập nhật' : 'Thêm vào hàng chờ biên tập'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      ) : null}

      {isTopicModalOpen ? (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content topic-bulk-modal">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title mb-1">{editingTopicId ? 'Sửa article topic' : 'Thêm article topic'}</h5>
                    <div className="topic-bulk-modal__subtitle">Thiết lập chủ đề để dùng ngay cho bộ lọc và phân loại bài đọc.</div>
                  </div>
                  <button type="button" className="btn-close" aria-label="Đóng" onClick={closeTopicModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên topic <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Ví dụ: Daily News"
                      value={topicDraft.name}
                      onChange={(event) => handleTopicField('name', event.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mô tả ngắn</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Mô tả phạm vi nội dung của topic"
                      value={topicDraft.description}
                      onChange={(event) => handleTopicField('description', event.target.value)}
                    ></textarea>
                  </div>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Độ khó mặc định</label>
                      <select
                        className="form-select"
                        value={topicDraft.defaultDifficulty}
                        onChange={(event) => handleTopicField('defaultDifficulty', event.target.value)}
                      >
                        {DIFFICULTY_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Trạng thái</label>
                      <select
                        className="form-select"
                        value={topicDraft.status}
                        onChange={(event) => handleTopicField('status', event.target.value)}
                      >
                        <option>Hoạt động</option>
                        <option>Tạm dừng</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Ảnh topic <span className="text-muted fw-normal">(URL)</span></label>
                      <input
                        className="form-control"
                        type="url"
                        placeholder="https://..."
                        value={topicDraft.articleTopicImage}
                        onChange={(event) => handleTopicField('articleTopicImage', event.target.value)}
                      />
                    </div>
                  </div>
                  {topicError ? <div className="text-danger mt-3">{topicError}</div> : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeTopicModal}>Hủy</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveTopic}>
                    {editingTopicId ? 'Lưu cập nhật' : 'Thêm topic'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      ) : null}
    </div>
  )
}
