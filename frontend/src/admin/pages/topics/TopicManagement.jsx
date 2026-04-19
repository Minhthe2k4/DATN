import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { topics as topicSeed } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, Badge, SimpleTable, StatGrid } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function normalizeTopicRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    defaultDifficulty: row.defaultDifficulty ?? 'Trung bình',
    lessons: row.lessons ?? 0,
    words: row.words ?? 0,
    status: row.status ?? 'Hoạt động',
  }
}

function createDraftRow(id) {
  return {
    id,
    name: '',
    description: '',
    defaultDifficulty: 'Trung bình',
    status: 'Hoạt động',
  }
}

export function TopicManagement() {
  const [topicRows, setTopicRows] = useState(topicSeed)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [draftTopics, setDraftTopics] = useState([
    createDraftRow('row-1'),
    createDraftRow('row-2'),
    createDraftRow('row-3'),
  ])
  const [quickPasteInput, setQuickPasteInput] = useState('')
  const [bulkError, setBulkError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

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
      label: 'Tổng từ đã gán',
      value: topicRows.reduce((sum, topic) => sum + topic.words, 0).toLocaleString('en-US'),
      meta: 'Chỉ số dùng để đánh giá độ sâu của từng chủ đề',
      icon: 'iconoir-book',
    },
  ], [topicRows])

  const filteredTopics = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return topicRows
    return topicRows.filter((topic) => 
      topic.name.toLowerCase().includes(term) || 
      topic.description.toLowerCase().includes(term)
    )
  }, [topicRows, searchTerm])

  const openBulkModal = () => {
    setBulkError('')
    setDraftTopics([
      createDraftRow('row-1'),
      createDraftRow('row-2'),
      createDraftRow('row-3'),
    ])
    setQuickPasteInput('')
    setIsBulkModalOpen(true)
  }

  const closeBulkModal = () => {
    setBulkError('')
    setIsBulkModalOpen(false)
  }

  const addDraftRow = () => {
    setDraftTopics((prev) => [...prev, createDraftRow(`row-${Date.now()}-${prev.length}`)])
  }

  const removeDraftRow = (id) => {
    setDraftTopics((prev) => {
      if (prev.length <= 1) {
        return prev
      }

      return prev.filter((item) => item.id !== id)
    })
  }

  const updateDraftRow = (id, field, value) => {
    setDraftTopics((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleBulkCreate = async () => {
    const manualTopics = draftTopics
      .map((item) => ({
        name: item.name.trim(),
        description: item.description.trim(),
        defaultDifficulty: item.defaultDifficulty,
        status: item.status,
      }))
      .filter((item) => item.name)

    const lines = quickPasteInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const pastedTopics = []
    const invalidLineNumbers = []

    lines.forEach((line, index) => {
      const parts = line.split('|').map((part) => part.trim())
      const name = parts[0]

      if (!name) {
        invalidLineNumbers.push(index + 1)
        return
      }

      pastedTopics.push({
        name,
        description: parts[1] || '',
        defaultDifficulty: parts[2] || 'Trung bình',
        status: parts[3] || 'Hoạt động',
      })
    })

    if (invalidLineNumbers.length > 0) {
      setBulkError(`Không thể đọc tên chủ đề ở dòng: ${invalidLineNumbers.join(', ')}.`)
      return
    }

    const mergedTopics = [...manualTopics, ...pastedTopics]
    if (mergedTopics.length === 0) {
      setBulkError('Bạn cần nhập ít nhất 1 chủ đề ở phần chính hoặc phần phụ.')
      return
    }

    const uniqueTopics = mergedTopics.filter((item, index, array) => {
      const key = item.name.toLowerCase()
      return array.findIndex((entry) => entry.name.toLowerCase() === key) === index
    })

    try {
      const createPromises = uniqueTopics.map((item) => fetch(`${API_BASE_URL}/api/admin/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          description: item.description || 'Chủ đề mới được thêm từ màn hình tạo hàng loạt.',
          defaultDifficulty: item.defaultDifficulty || 'Trung bình',
          status: item.status || 'Hoạt động',
        }),
      }))

      const results = await Promise.all(createPromises)
      const failed = results.find((response) => !response.ok)
      if (failed) {
        throw new Error(`Create topic failed: ${failed.status}`)
      }

      const refresh = await fetch(`${API_BASE_URL}/api/admin/topics`)
      if (!refresh.ok) {
        throw new Error(`Cannot refresh topics: ${refresh.status}`)
      }

      const refreshedPayload = await refresh.json()
      setTopicRows(Array.isArray(refreshedPayload) ? refreshedPayload.map(normalizeTopicRow) : topicSeed)
      setBulkError('')
      setQuickPasteInput('')
      setIsBulkModalOpen(false)
    } catch {
      setBulkError('Tạo chủ đề thất bại. Vui lòng kiểm tra backend và thử lại.')
    }
  }

  return (
    <div className="page-content topic-management-page">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Content Management"
          title="Quản lý chủ đề"
          description="Tổ chức hệ thống chủ đề để đồng bộ việc phân loại từ vựng, bài học và bài đọc."
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={openBulkModal}>Thêm chủ đề</button>
            </>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu chủ đề từ backend...</div> : null}
        {loadError ? <div className="alert alert-warning border">{loadError}</div> : null}

        <StatGrid items={stats} />

        <div className="row g-3 mt-1">
          <div className="col-12">
            <AdminSectionCard
              className="topic-list-card"
              title="Danh sách chủ đề"
              description="Theo dõi trạng thái, độ khó mặc định và phạm vi sử dụng của từng chủ đề."
              actions={<span className="topic-list-card__count">{filteredTopics.length} chủ đề</span>}
            >
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="iconoir-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Tìm kiếm theo tên hoặc mô tả chủ đề..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <SimpleTable
                columns={[
                  { key: 'name', label: 'Tên chủ đề' },
                  { key: 'description', label: 'Mô tả' },
                  { key: 'defaultDifficulty', label: 'Độ khó mặc định' },
                  { key: 'lessons', label: 'Bài học' },
                  { key: 'words', label: 'Số từ' },
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
                        <Link to={`/admin/topics/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                        <Link to={`/admin/topics/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
                      </div>
                    ),
                  },
                ]}
                rows={filteredTopics}
              />
            </AdminSectionCard>
          </div>
        </div>
      </div>

      {isBulkModalOpen ? (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content topic-bulk-modal">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title mb-1">Tạo hàng loạt chủ đề</h5>
                    <div className="topic-bulk-modal__subtitle">Nhập nhanh như Quizlet: nhiều dòng, tập trung tốc độ tạo nội dung.</div>
                  </div>
                  <button type="button" className="btn-close" aria-label="Đóng" onClick={closeBulkModal}></button>
                </div>
                <div className="modal-body">
                  <div className="d-grid gap-2">
                    {draftTopics.map((item, index) => (
                      <div className="topic-draft-row" key={item.id}>
                        <div className="row g-2 align-items-start">
                          <div className="col-12 col-md-3">
                            <label className="form-label small text-muted mb-1">Chủ đề #{index + 1}</label>
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Ví dụ: Business English"
                              value={item.name}
                              onChange={(event) => updateDraftRow(item.id, 'name', event.target.value)}
                            />
                          </div>
                          <div className="col-12 col-md-4">
                            <label className="form-label small text-muted mb-1">Mô tả ngắn</label>
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Ngữ cảnh sử dụng và phạm vi nội dung"
                              value={item.description}
                              onChange={(event) => updateDraftRow(item.id, 'description', event.target.value)}
                            />
                          </div>
                          <div className="col-6 col-md-2">
                            <label className="form-label small text-muted mb-1">Độ khó</label>
                            <select
                              className="form-select"
                              value={item.defaultDifficulty}
                              onChange={(event) => updateDraftRow(item.id, 'defaultDifficulty', event.target.value)}
                            >
                              <option>Cơ bản</option>
                              <option>Trung bình</option>
                              <option>Nâng cao</option>
                            </select>
                          </div>
                          <div className="col-6 col-md-2">
                            <label className="form-label small text-muted mb-1">Trạng thái</label>
                            <select
                              className="form-select"
                              value={item.status}
                              onChange={(event) => updateDraftRow(item.id, 'status', event.target.value)}
                            >
                              <option>Hoạt động</option>
                              <option>Tạm dừng</option>
                            </select>
                          </div>
                          <div className="col-12 col-md-1 d-grid">
                            <label className="form-label small text-muted mb-1">&nbsp;</label>
                            <button
                              type="button"
                              className="btn btn-outline-danger topic-draft-row__delete"
                              onClick={() => removeDraftRow(item.id)}
                              disabled={draftTopics.length <= 1}
                            >
                              <i className="iconoir-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="btn btn-outline-primary mt-3" onClick={addDraftRow}>
                    + Thêm dòng chủ đề
                  </button>

                  <div className="topic-secondary-panel mt-3">
                    <label className="form-label small text-muted mb-1">Dán nhanh danh sách (mỗi dòng: Tên | Mô tả | Độ khó | Trạng thái)</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Travel & Tourism | Từ vựng du lịch thực tế | Trung bình | Hoạt động"
                      value={quickPasteInput}
                      onChange={(event) => setQuickPasteInput(event.target.value)}
                    ></textarea>
                  </div>

                  {bulkError ? <div className="text-danger mt-2">{bulkError}</div> : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeBulkModal}>Hủy</button>
                  <button type="button" className="btn btn-primary" onClick={handleBulkCreate}>Tạo danh sách chủ đề</button>
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