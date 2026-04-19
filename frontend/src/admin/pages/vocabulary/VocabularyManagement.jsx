import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessons, vocabularyEntries } from '../../data/adminData'
import {
  AdminPageHeader,
  AdminSectionCard,
  Badge,
  FilterTabs,
  SimpleTable,
  StatGrid,
} from '../../components/console/AdminUi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const LEVELS = ['Cơ bản', 'Trung bình', 'Nâng cao']
const STATUSES = ['Chờ duyệt', 'Đã duyệt']

async function requestGeneratedPronunciation(word) {
  const response = await fetch(`${API_BASE_URL}/api/admin/vocabulary/pronunciation/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word }),
  })

  if (!response.ok) {
    throw new Error(`Generate pronunciation failed: ${response.status}`)
  }

  const payload = await response.json()
  return payload?.pronunciation || ''
}

function normalizeStatus(status) {
  if (status === 'Chờ rà soát') {
    return 'Chờ duyệt'
  }
  return status || 'Chờ duyệt'
}

function createDraftRow(id) {
  return {
    id,
    word: '',
    pronunciation: '',
    part_of_speech: 'noun',
    meaning_en: '',
    meaning_vi: '',
    example: '',
    example_vi: '',
    level: 'Cơ bản',
    status: 'Chờ duyệt',
  }
}

function resolveLessonId(entry) {
  if (entry.lesson_id || entry.lessonId) {
    return entry.lesson_id || entry.lessonId
  }

  const fallback = lessons.find((lesson) => String(lesson.topic_id) === String(entry.topic_id || entry.topicId))
  return fallback?.id || ''
}

function normalizeLessonRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    topic_id: row.topicId ?? row.topic_id ?? '',
  }
}

function normalizeVocabularyRow(row) {
  return {
    id: row.id,
    word: row.word ?? '',
    pronunciation: row.pronunciation ?? '',
    part_of_speech: row.partOfSpeech ?? row.part_of_speech ?? 'noun',
    meaning_en: row.meaningEn ?? row.meaning_en ?? '',
    meaning_vi: row.meaningVi ?? row.meaning_vi ?? '',
    example: row.example ?? '',
    example_vi: row.exampleVi ?? row.example_vi ?? '',
    level: row.level ?? 'Trung bình',
    status: normalizeStatus(row.status),
    lesson_id: row.lessonId ?? row.lesson_id ?? '',
    topic_id: row.topicId ?? row.topic_id ?? '',
  }
}

export function VocabularyManagement() {
  const [activeFilter, setActiveFilter] = useState('Tất cả')
  const [entries, setEntries] = useState(
    vocabularyEntries.map((entry) => ({ ...entry, status: normalizeStatus(entry.status) }))
  )
  const [lessonRows, setLessonRows] = useState(lessons)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState('')
  const [draftRows, setDraftRows] = useState([
    createDraftRow('row-1'),
    createDraftRow('row-2'),
    createDraftRow('row-3'),
  ])
  const [showPastePanel, setShowPastePanel] = useState(false)
  const [quickPasteInput, setQuickPasteInput] = useState('')
  const [modalError, setModalError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [generatingRowId, setGeneratingRowId] = useState('')
  const [isAutoGeneratingPronunciation, setIsAutoGeneratingPronunciation] = useState(false)

  useEffect(() => {
    let isDisposed = false

    async function loadData() {
      try {
        const [vocabularyResponse, lessonResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/vocabulary`),
          fetch(`${API_BASE_URL}/api/admin/lessons`),
        ])

        if (!vocabularyResponse.ok || !lessonResponse.ok) {
          throw new Error('Cannot fetch vocabulary/lesson data')
        }

        const [vocabularyPayload, lessonPayload] = await Promise.all([
          vocabularyResponse.json(),
          lessonResponse.json(),
        ])

        if (isDisposed) {
          return
        }

        setEntries(Array.isArray(vocabularyPayload)
          ? vocabularyPayload.map(normalizeVocabularyRow)
          : vocabularyEntries.map((entry) => ({ ...entry, status: normalizeStatus(entry.status) })))

        setLessonRows(Array.isArray(lessonPayload)
          ? lessonPayload.map(normalizeLessonRow)
          : lessons)

        setLoadError('')
      } catch {
        if (isDisposed) {
          return
        }

        setEntries(vocabularyEntries.map((entry) => ({ ...entry, status: normalizeStatus(entry.status) })))
        setLessonRows(lessons)
        setLoadError('Không thể tải từ vựng/bài học từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!isDisposed) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isDisposed = true
    }
  }, [])

  const filteredRows = entries.filter((entry) => {
    const statusMatch = activeFilter === 'Tất cả' ? true : normalizeStatus(entry.status) === activeFilter
    
    if (!statusMatch) return false
    
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true
    
    return (
      entry.word.toLowerCase().includes(term) ||
      entry.meaning_vi.toLowerCase().includes(term) ||
      entry.meaning_en.toLowerCase().includes(term)
    )
  })

  const openModal = () => {
    setSelectedLesson('')
    setDraftRows([createDraftRow('row-1'), createDraftRow('row-2'), createDraftRow('row-3')])
    setShowPastePanel(false)
    setQuickPasteInput('')
    setModalError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setModalError('')
    setIsModalOpen(false)
  }

  const addDraftRow = () => {
    setDraftRows((prev) => [...prev, createDraftRow(`row-${Date.now()}`)])
  }

  const removeDraftRow = (id) => {
    setDraftRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)))
  }

  const updateDraftRow = (id, field, value) => {
    setDraftRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const generatePronunciationForRow = async (rowId) => {
    const row = draftRows.find((item) => item.id === rowId)
    const word = row?.word?.trim() || ''

    if (!word) {
      setModalError('Nhập từ tiếng Anh trước khi gen phiên âm.')
      return
    }

    try {
      setGeneratingRowId(rowId)
      const generated = await requestGeneratedPronunciation(word)
      if (!generated) {
        throw new Error('Empty pronunciation')
      }

      updateDraftRow(rowId, 'pronunciation', generated)
      setModalError('')
    } catch {
      setModalError('Không thể gen phiên âm lúc này. Vui lòng thử lại.')
    } finally {
      setGeneratingRowId('')
    }
  }

  const handleCreate = async () => {
    if (!selectedLesson) {
      setModalError('Bạn cần chọn bài học trước khi thêm từ vựng.')
      return
    }

    const selectedLessonRow = lessonRows.find((lesson) => String(lesson.id) === String(selectedLesson))
    if (!selectedLessonRow) {
      setModalError('Bài học không tồn tại. Vui lòng chọn lại.')
      return
    }

    const manualRows = draftRows
      .filter((r) => r.word.trim())
      .map((r) => ({
        word: r.word.trim(),
        pronunciation: r.pronunciation.trim() || '',
        part_of_speech: r.part_of_speech,
        meaning_en: r.meaning_en.trim(),
        meaning_vi: r.meaning_vi.trim(),
        example: r.example.trim(),
        example_vi: r.example_vi.trim(),
        level: r.level,
        status: normalizeStatus(r.status),
      }))

    const pastedRows = []
    const invalidLines = []
    quickPasteInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line, i) => {
        const parts = line.split('|').map((p) => p.trim())
        if (!parts[0]) {
          invalidLines.push(i + 1)
          return
        }

        pastedRows.push({
          word: parts[0],
          pronunciation: parts[1] || '',
          part_of_speech: parts[2] || 'noun',
          meaning_en: parts[3] || '',
          meaning_vi: parts[4] || '',
          example: parts[5] || '',
          level: parts[6] || 'Cơ bản',
          status: normalizeStatus(parts[7] || 'Chờ duyệt'),
        })
      })

    if (invalidLines.length > 0) {
      setModalError(`Không đọc được từ ở dòng: ${invalidLines.join(', ')}.`)
      return
    }

    const merged = [...manualRows, ...pastedRows]
    if (merged.length === 0) {
      setModalError('Bạn cần nhập ít nhất 1 từ ở phần chính hoặc phần dán nhanh.')
      return
    }

    let readyRows = merged
    const rowsNeedPronunciation = merged.filter((item) => !item.pronunciation.trim())
    if (rowsNeedPronunciation.length > 0) {
      try {
        setIsAutoGeneratingPronunciation(true)
        readyRows = await Promise.all(merged.map(async (item) => {
          if (item.pronunciation.trim()) {
            return item
          }

          const generated = await requestGeneratedPronunciation(item.word)
          return {
            ...item,
            pronunciation: (generated || '').trim(),
          }
        }))
      } catch {
        setModalError('Không thể tự gen phiên âm cho một số từ. Vui lòng thử lại hoặc nhập tay.')
        return
      } finally {
        setIsAutoGeneratingPronunciation(false)
      }
    }

    const missingPronunciationWords = readyRows
      .filter((item) => !item.pronunciation.trim())
      .map((item) => item.word)
    if (missingPronunciationWords.length > 0) {
      setModalError(`Không thể gen phiên âm cho: ${missingPronunciationWords.join(', ')}.`)
      return
    }

    try {
      const createPromises = readyRows.map((item) => fetch(`${API_BASE_URL}/api/admin/vocabulary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: item.word,
          pronunciation: item.pronunciation,
          partOfSpeech: item.part_of_speech,
          meaningEn: item.meaning_en,
          meaningVi: item.meaning_vi,
          example: item.example,
          exampleVi: item.example_vi,
          level: item.level,
          status: item.status,
          lessonId: Number(selectedLesson),
        }),
      }))

      const createResults = await Promise.all(createPromises)
      const failed = createResults.find((response) => !response.ok)
      if (failed) {
        throw new Error(`Create vocabulary failed: ${failed.status}`)
      }

      const refresh = await fetch(`${API_BASE_URL}/api/admin/vocabulary`)
      if (!refresh.ok) {
        throw new Error(`Cannot refresh vocabulary: ${refresh.status}`)
      }

      const refreshedPayload = await refresh.json()
      setEntries(Array.isArray(refreshedPayload)
        ? refreshedPayload.map(normalizeVocabularyRow)
        : vocabularyEntries.map((entry) => ({ ...entry, status: normalizeStatus(entry.status) })))
      setModalError('')
      setIsModalOpen(false)
    } catch {
      setModalError('Tạo từ vựng thất bại. Vui lòng kiểm tra backend và thử lại.')
    }
  }

  const stats = [
    {
      label: 'Tổng số từ vựng',
      value: entries.length.toString(),
      meta: 'Dữ liệu từ vựng tập trung trong hệ thống',
      icon: 'iconoir-book',
    },
    {
      label: 'Đã duyệt',
      value: entries.filter((entry) => normalizeStatus(entry.status) === 'Đã duyệt').length.toString(),
      meta: 'Sẵn sàng đưa vào bài học và bài đọc',
      icon: 'iconoir-check-circle',
    },
    {
      label: 'Chờ duyệt',
      value: entries.filter((entry) => normalizeStatus(entry.status) === 'Chờ duyệt').length.toString(),
      meta: 'Cần kiểm tra nghĩa, ví dụ và bài học',
      icon: 'iconoir-warning-circle',
    },
    {
      label: 'Bài học có từ vựng',
      value: new Set(entries.map((entry) => resolveLessonId(entry)).filter(Boolean)).size.toString(),
      meta: 'Số bài học đang được gán từ vựng',
      icon: 'iconoir-page',
    },
  ]

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Vocabulary Governance"
          title="Quản lý từ vựng"
          description="Kiểm soát vòng đời từ vựng từ lúc nhập liệu, rà soát đến khi phát hành vào nội dung học."
          actions={
            <>
              <button type="button" className="btn btn-primary" onClick={openModal}>Thêm từ vựng</button>
            </>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu từ vựng từ backend...</div> : null}
        {loadError ? <div className="alert alert-warning border">{loadError}</div> : null}

        <StatGrid items={stats} />

        <div className="row g-3 mt-1">
          <div className="col-12">
            <AdminSectionCard
              title="Kho từ vựng"
              description="Danh sách từ hiện có, cho phép lọc theo trạng thái duyệt để xử lý nhanh theo từng nhóm."
            >
              <div className="mb-3">
                <div className="row g-3">
                  <div className="col-12 col-md-auto">
                    <FilterTabs items={['Tất cả', 'Chờ duyệt', 'Đã duyệt']} active={activeFilter} onChange={setActiveFilter} />
                  </div>
                  <div className="col-12 col-md">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="iconoir-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Tìm kiếm theo từ, nghĩa Việt hoặc nghĩa Anh..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <SimpleTable
                columns={[
                  { key: 'word', label: 'Từ' },
                  { key: 'pronunciation', label: 'Phiên âm' },
                  { key: 'part_of_speech', label: 'Từ loại' },
                  { key: 'meaning_vi', label: 'Nghĩa Việt' },
                  {
                    key: 'lesson',
                    label: 'Bài học',
                    render: (row) => {
                      const lessonName = lessonRows.find((lesson) => String(lesson.id) === String(resolveLessonId(row)))?.name || 'Chưa gán bài học'
                      return lessonName
                    },
                  },
                  { key: 'level', label: 'Mức độ' },
                  {
                    key: 'status',
                    label: 'Trạng thái',
                    render: (row) => <Badge tone={normalizeStatus(row.status) === 'Đã duyệt' ? 'success' : 'warning'}>{normalizeStatus(row.status)}</Badge>,
                  },
                  {
                    key: 'actions',
                    label: 'Hành động',
                    render: (row) => (
                      <div className="d-flex flex-wrap gap-2">
                        <Link to={`/admin/vocabulary/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                        <Link to={`/admin/vocabulary/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
                      </div>
                    ),
                  },
                ]}
                rows={filteredRows}
              />
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
                    <h5 className="modal-title mb-1">Thêm hàng loạt từ vựng</h5>
                    <div className="topic-bulk-modal__subtitle">Nhập đầy đủ thuộc tính từ vựng và chọn bài học để gán. Từ mới sẽ vào hàng chờ duyệt theo từng dòng.</div>
                  </div>
                  <button type="button" className="btn-close" aria-label="Đóng" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="topic-bulk-hero mb-4">
                    <div className="fw-semibold mb-2">Bước 1 — Chọn bài học</div>
                    <div className="text-muted small mb-2">Tất cả từ bên dưới sẽ được gán vào bài học này sau khi xác nhận.</div>
                    <select
                      className="form-select"
                      value={selectedLesson}
                      onChange={(e) => {
                        setSelectedLesson(e.target.value)
                        setModalError('')
                      }}
                    >
                      <option value="">— Chọn bài học —</option>
                      {lessonRows.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>{lesson.name}</option>
                      ))}
                    </select>
                    {selectedLesson ? (
                      <div className="topic-bulk-hero__meta mt-2">
                        <span>Bài học: <strong>{lessonRows.find((lesson) => String(lesson.id) === String(selectedLesson))?.name}</strong></span>
                        <span>{draftRows.length} từ sẽ thêm</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="fw-semibold mb-2">Bước 2 — Nhập danh sách từ</div>

                  <div className="d-grid gap-2">
                    {draftRows.map((item, index) => (
                      <div className="topic-draft-row" key={item.id}>
                        <div className="row g-2 align-items-end">
                          <div className="col-12 col-md-2">
                            <label className="form-label small text-muted mb-1">Từ tiếng Anh #{index + 1}</label>
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Ví dụ: resilient"
                              value={item.word}
                              onChange={(e) => updateDraftRow(item.id, 'word', e.target.value)}
                            />
                          </div>
                          <div className="col-12 col-md-2">
                            <label className="form-label small text-muted mb-1">Phiên âm</label>
                            <div className="input-group">
                              <input
                                className="form-control"
                                type="text"
                                placeholder="/rɪˈzɪliənt/"
                                value={item.pronunciation}
                                onChange={(e) => updateDraftRow(item.id, 'pronunciation', e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => generatePronunciationForRow(item.id)}
                                disabled={generatingRowId === item.id}
                              >
                                {generatingRowId === item.id ? '...' : 'AI'}
                              </button>
                            </div>
                          </div>
                          <div className="col-12 col-md-2">
                            <label className="form-label small text-muted mb-1">Định nghĩa EN</label>
                            <input
                              className="form-control"
                              type="text"
                              placeholder="English meaning"
                              value={item.meaning_en}
                              onChange={(e) => updateDraftRow(item.id, 'meaning_en', e.target.value)}
                            />
                          </div>
                          <div className="col-12 col-md-2">
                            <label className="form-label small text-muted mb-1">Nghĩa tiếng Việt</label>
                            <input
                              className="form-control"
                              type="text"
                              placeholder="kiên cường, bền bỉ"
                              value={item.meaning_vi}
                              onChange={(e) => updateDraftRow(item.id, 'meaning_vi', e.target.value)}
                            />
                          </div>
                          <div className="col-12 col-md-2">
                            <label className="form-label small text-muted mb-1">Ví dụ</label>
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Example sentence"
                              value={item.example}
                              onChange={(e) => updateDraftRow(item.id, 'example', e.target.value)}
                            />
                          </div>
                          <div className="col-12 col-md-2">
                            <label className="form-label small text-muted mb-1">Dịch ví dụ</label>
                            <input
                              className="form-control"
                              type="text"
                              placeholder="Nghĩa của ví dụ..."
                              value={item.example_vi}
                              onChange={(e) => updateDraftRow(item.id, 'example_vi', e.target.value)}
                            />
                          </div>
                          <div className="col-6 col-md-1">
                            <label className="form-label small text-muted mb-1">Từ loại</label>
                            <select
                              className="form-select"
                              value={item.part_of_speech}
                              onChange={(e) => updateDraftRow(item.id, 'part_of_speech', e.target.value)}
                            >
                              {['noun', 'verb', 'adjective', 'adverb'].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="col-6 col-md-1">
                            <label className="form-label small text-muted mb-1">Mức độ</label>
                            <select
                              className="form-select"
                              value={item.level}
                              onChange={(e) => updateDraftRow(item.id, 'level', e.target.value)}
                            >
                              {LEVELS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="col-6 col-md-1">
                            <label className="form-label small text-muted mb-1">Duyệt</label>
                            <select
                              className="form-select"
                              value={item.status}
                              onChange={(e) => updateDraftRow(item.id, 'status', e.target.value)}
                            >
                              {STATUSES.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="col-6 col-md-1">
                            <label className="form-label small text-muted mb-1">&nbsp;</label>
                            <button
                              type="button"
                              className="btn btn-outline-danger topic-draft-row__delete d-block w-100"
                              onClick={() => removeDraftRow(item.id)}
                              disabled={draftRows.length <= 1}
                            >
                              <i className="iconoir-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="btn btn-outline-primary mt-3" onClick={addDraftRow}>
                    + Thêm dòng từ vựng
                  </button>

                  <button
                    type="button"
                    className="btn btn-link text-decoration-none d-block px-0 mt-3"
                    onClick={() => setShowPastePanel((prev) => !prev)}
                  >
                    {showPastePanel ? 'Ẩn phần dán nhanh' : 'Dán nhanh nhiều từ (tuỳ chọn)'}
                  </button>

                  {showPastePanel ? (
                    <div className="topic-secondary-panel">
                      <div className="fw-semibold mb-1">Dán nhanh danh sách từ</div>
                      <div className="text-muted small mb-2">
                        Mỗi dòng theo định dạng: <code>từ | phiên âm | từ loại | nghĩa EN | nghĩa VI | ví dụ | mức độ | trạng thái</code><br />
                        Có thể bỏ trống các cột phía sau.
                      </div>
                      <textarea
                        className="form-control font-monospace"
                        rows={6}
                        placeholder={`resilient | /rɪˈzɪliənt/ | adjective | able to recover quickly | kiên cường, bền bỉ | The startup remained resilient. | Trung bình | Chờ duyệt\nambiguous | /æmˈbɪgjuəs/ | adjective | open to multiple interpretations | mơ hồ | The sentence is ambiguous. | Cơ bản | Chờ duyệt`}
                        value={quickPasteInput}
                        onChange={(e) => setQuickPasteInput(e.target.value)}
                      />
                    </div>
                  ) : null}

                  {modalError ? <div className="text-danger mt-3">{modalError}</div> : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Hủy</button>
                  <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={isAutoGeneratingPronunciation}>
                    {isAutoGeneratingPronunciation ? 'Đang tự gen phiên âm...' : 'Thêm vào hàng chờ duyệt'}
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
