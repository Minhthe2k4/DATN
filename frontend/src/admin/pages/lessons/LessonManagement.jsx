import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessons as lessonSeed, topics } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, Badge, SimpleTable, StatGrid } from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const DIFFICULTY_OPTIONS = ['Cơ bản', 'Trung bình', 'Nâng cao']
const STATUS_OPTIONS = ['Đang mở', 'Nháp']

function createDraftRow(id) {
  return { id, name: '', description: '', topic_id: '', difficulty: 'Trung bình', status: 'Đang mở' }
}

function normalizeLessonRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    topic_id: row.topicId ?? row.topic_id ?? '',
    difficulty: row.difficulty ?? 'Trung bình',
    status: row.status ?? 'Nháp',
  }
}

function normalizeTopicRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
  }
}

export function LessonManagement() {
  const [lessonRows, setLessonRows] = useState(lessonSeed)
  const [topicRows, setTopicRows] = useState(topics)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draftLessons, setDraftLessons] = useState([
    createDraftRow('row-1'),
    createDraftRow('row-2'),
    createDraftRow('row-3'),
  ])
  const [modalError, setModalError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTopicId, setFilterTopicId] = useState('')

  useEffect(() => {
    let isDisposed = false

    async function loadLessonsAndTopics() {
      try {
        const [lessonResponse, topicResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/lessons`),
          fetch(`${API_BASE_URL}/api/admin/topics`),
        ])

        if (!lessonResponse.ok || !topicResponse.ok) {
          throw new Error('Cannot fetch lesson/topic data')
        }

        const [lessonPayload, topicPayload] = await Promise.all([
          lessonResponse.json(),
          topicResponse.json(),
        ])

        if (isDisposed) {
          return
        }

        setLessonRows(Array.isArray(lessonPayload) ? lessonPayload.map(normalizeLessonRow) : lessonSeed)
        setTopicRows(Array.isArray(topicPayload) ? topicPayload.map(normalizeTopicRow) : topics)
        setLoadError('')
      } catch (error) {
        if (isDisposed) {
          return
        }

        setLessonRows(lessonSeed)
        setTopicRows(topics)
        setLoadError('Không thể tải bài học/chủ đề từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!isDisposed) {
          setIsLoading(false)
        }
      }
    }

    loadLessonsAndTopics()

    return () => {
      isDisposed = true
    }
  }, [])

  const openModal = () => {
    setDraftLessons([createDraftRow('row-1'), createDraftRow('row-2'), createDraftRow('row-3')])
    setModalError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setModalError('')
    setIsModalOpen(false)
  }

  const addDraftRow = () => {
    setDraftLessons((prev) => [...prev, createDraftRow(`row-${Date.now()}`)])
  }

  const removeDraftRow = (id) => {
    setDraftLessons((prev) => prev.length <= 1 ? prev : prev.filter((item) => item.id !== id))
  }

  const updateDraftRow = (id, field, value) => {
    setDraftLessons((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleCreate = async () => {
    const validRows = draftLessons.filter((item) => item.name.trim())
    if (validRows.length === 0) {
      setModalError('Bạn cần nhập tên cho ít nhất 1 bài học.')
      return
    }

    const fallbackTopicId = topicRows[0]?.id
    if (!fallbackTopicId && validRows.some((row) => !row.topic_id)) {
      setModalError('Chưa có chủ đề để gán cho bài học mới.')
      return
    }

    try {
      const createPromises = validRows.map((item) => fetch(`${API_BASE_URL}/api/admin/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name.trim(),
          description: item.description.trim() || 'Mô tả chưa được thêm',
          topicId: item.topic_id || fallbackTopicId,
          difficulty: item.difficulty,
          status: item.status,
        }),
      }))

      const results = await Promise.all(createPromises)
      const failed = results.find((response) => !response.ok)
      if (failed) {
        throw new Error(`Create lesson failed: ${failed.status}`)
      }

      const refresh = await fetch(`${API_BASE_URL}/api/admin/lessons`)
      if (!refresh.ok) {
        throw new Error(`Cannot refresh lessons: ${refresh.status}`)
      }

      const refreshedPayload = await refresh.json()
      setLessonRows(Array.isArray(refreshedPayload) ? refreshedPayload.map(normalizeLessonRow) : lessonSeed)
      setModalError('')
      setIsModalOpen(false)
    } catch (error) {
      setModalError('Tạo bài học thất bại. Vui lòng kiểm tra backend và thử lại.')
    }
  }

  const stats = [
    {
      label: 'Tổng số bài học',
      value: lessonRows.length.toString(),
      meta: 'Có thể gán vào các chủ đề cụ thể',
      icon: 'iconoir-page',
    },
    {
      label: 'Đang mở',
      value: lessonRows.filter((lesson) => lesson.status === 'Đang mở').length.toString(),
      meta: 'Đang xuất hiện trên hệ thống học',
      icon: 'iconoir-play',
    },
    {
      label: 'Bản nháp',
      value: lessonRows.filter((lesson) => lesson.status === 'Nháp').length.toString(),
      meta: 'Chưa sẵn sàng phát hành',
      icon: 'iconoir-edit-pencil',
    },
    {
      label: 'Khó trung bình',
      value: lessonRows.filter((lesson) => lesson.difficulty === 'Trung bình').length.toString(),
      meta: 'Bài học ở mức trung bình',
      icon: 'iconoir-stats',
    },
  ]

  const difficultyDistribution = useMemo(() => {
    const total = lessonRows.length

    return DIFFICULTY_OPTIONS.map((difficulty) => {
      const count = lessonRows.filter((lesson) => lesson.difficulty === difficulty).length
      const ratio = total > 0 ? (count / total) * 100 : 0
      const tone =
        difficulty === 'Cơ bản'
          ? 'is-basic'
          : difficulty === 'Trung bình'
            ? 'is-mid'
            : 'is-advanced'

      return {
        difficulty,
        count,
        ratio,
        tone,
      }
    })
  }, [lessonRows])

  const filteredLessons = useMemo(() => {
    let result = lessonRows
    const term = searchTerm.toLowerCase().trim()
    
    if (term) {
      result = result.filter(lesson => 
        lesson.name.toLowerCase().includes(term) || 
        lesson.description.toLowerCase().includes(term)
      )
    }
    
    if (filterTopicId) {
      result = result.filter(lesson => String(lesson.topic_id) === String(filterTopicId))
    }
    
    return result
  }, [lessonRows, searchTerm, filterTopicId])

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Lesson Builder"
          title="Quản lý bài học"
          description="Thiết lập cấu trúc bài học theo chủ đề, độ khó và khối lượng từ vựng phù hợp."
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={openModal}>Thêm bài học</button>
            </>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu bài học từ backend...</div> : null}
        {loadError ? <div className="alert alert-warning border">{loadError}</div> : null}

        <StatGrid items={stats} />

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-8">
            <AdminSectionCard title="Danh sách bài học" description="Quản lý trạng thái, độ khó và mô tả của từng bài học trong hệ thống.">
              <div className="row g-2 mb-3">
                <div className="col-12 col-md-7">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="iconoir-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Tìm theo tên bài hoặc mô tả..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-5">
                  <select 
                    className="form-select" 
                    value={filterTopicId}
                    onChange={(e) => setFilterTopicId(e.target.value)}
                  >
                    <option value="">— Tất cả chủ đề —</option>
                    {topicRows.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <SimpleTable
                columns={[
                  { key: 'name', label: 'Tên bài' },
                  {
                    key: 'topic',
                    label: 'Chủ đề',
                    render: (row) => {
                      const topicName = topicRows.find((t) => t.id === row.topic_id)?.name || 'Không xác định'
                      return topicName
                    },
                  },
                  { key: 'difficulty', label: 'Độ khó' },
                  {
                    key: 'status',
                    label: 'Trạng thái',
                    render: (row) => <Badge tone={row.status === 'Đang mở' ? 'success' : 'warning'}>{row.status}</Badge>,
                  },
                  {
                    key: 'actions',
                    label: 'Hành động',
                    render: (row) => (
                      <div className="d-flex flex-wrap gap-2">
                        <Link to={`/admin/lessons/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                        <Link to={`/admin/lessons/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
                      </div>
                    ),
                  },
                ]}
                rows={filteredLessons}
              />
            </AdminSectionCard>
          </div>
          <div className="col-12 col-xl-4">
            <AdminSectionCard title="Phân bố độ khó" description="Số lượng bài học theo từng mức độ">
              <div className="lesson-difficulty-grid">
                {difficultyDistribution.map((item) => (
                  <div className={`lesson-difficulty-item ${item.tone}`} key={item.difficulty}>
                    <div className="lesson-difficulty-item__header">
                      <span className="lesson-difficulty-item__label">{item.difficulty}</span>
                      <span className="lesson-difficulty-item__count">{item.count}</span>
                    </div>
                    <div className="lesson-difficulty-item__track" role="progressbar" aria-valuenow={Math.round(item.ratio)} aria-valuemin="0" aria-valuemax="100">
                      <div className="lesson-difficulty-item__fill" style={{ width: `${item.ratio}%` }}></div>
                    </div>
                    <div className="lesson-difficulty-item__meta">{item.ratio.toFixed(1)}% tổng số bài học</div>
                  </div>
                ))}
                <div className="lesson-difficulty-summary">Tổng số bài: <strong>{lessonRows.length}</strong></div>
              </div>
            </AdminSectionCard>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" role="document">
              <div className="modal-content topic-bulk-modal">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title mb-1">Tạo hàng loạt bài học</h5>
                    <div className="topic-bulk-modal__subtitle">Nhập tên bài, chọn chủ đề và cài độ khó ngay trong từng dòng.</div>
                  </div>
                  <button type="button" className="btn-close" aria-label="Đóng" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="d-grid gap-2">
                    {draftLessons.map((item, index) => (
                      <div className="topic-draft-row" key={item.id}>
                        <div className="row g-2 align-items-end">
                          <div className="col-12 col-md-3">
                            <label className="form-label small text-muted mb-1">Tên bài học #{index + 1}</label>
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Ví dụ: Email Negotiation Basics"
                              value={item.name}
                              onChange={(event) => updateDraftRow(item.id, 'name', event.target.value)}
                            />
                          </div>
                          <div className="col-12 col-md-3">
                            <label className="form-label small text-muted mb-1">Mô tả</label>
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Mô tả nội dung bài học"
                              value={item.description}
                              onChange={(event) => updateDraftRow(item.id, 'description', event.target.value)}
                            />
                          </div>
                          <div className="col-12 col-md-3">
                            <label className="form-label small text-muted mb-1">Chủ đề</label>
                            <select
                              className="form-select"
                              value={item.topic_id}
                              onChange={(event) => updateDraftRow(item.id, 'topic_id', event.target.value)}
                            >
                              <option value="">— Chưa phân loại —</option>
                              {topicRows.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-6 col-md-2">
                            <label className="form-label small text-muted mb-1">Độ khó</label>
                            <select
                              className="form-select"
                              value={item.difficulty}
                              onChange={(event) => updateDraftRow(item.id, 'difficulty', event.target.value)}
                            >
                              {DIFFICULTY_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="col-6 col-md-2">
                            <label className="form-label small text-muted mb-1">Trạng thái</label>
                            <select
                              className="form-select"
                              value={item.status}
                              onChange={(event) => updateDraftRow(item.id, 'status', event.target.value)}
                            >
                              {STATUS_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="col-12 col-md-1">
                            <label className="form-label small text-muted mb-1">&nbsp;</label>
                            <button
                              type="button"
                              className="btn btn-outline-danger topic-draft-row__delete d-block w-100"
                              onClick={() => removeDraftRow(item.id)}
                              disabled={draftLessons.length <= 1}
                            >
                              <i className="iconoir-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="btn btn-outline-primary mt-3" onClick={addDraftRow}>
                    + Thêm dòng bài học
                  </button>

                  {modalError ? <div className="text-danger mt-3">{modalError}</div> : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Hủy</button>
                  <button type="button" className="btn btn-primary" onClick={handleCreate}>Tạo danh sách bài học</button>
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