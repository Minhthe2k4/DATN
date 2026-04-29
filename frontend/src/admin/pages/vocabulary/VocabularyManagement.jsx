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
  Pagination,
} from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function normalizeStatus(status) {
  if (status === 'Chờ rà soát' || status === 'Nháp') {
    return 'Chờ duyệt'
  }
  return status || 'Chờ duyệt'
}

function resolveLessonId(entry, lessonRows) {
  if (entry.lesson_id || entry.lessonId) {
    return entry.lesson_id || entry.lessonId
  }
  return ''
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
    type_of_word: row.typeOfWord ?? row.type_of_word ?? 'noun',
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

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

    const lessonMatch = selectedLessonId === 'all' ? true : String(entry.lesson_id) === selectedLessonId
    if (!lessonMatch) return false

    const levelMatch = selectedLevel === 'all' ? true : entry.level === selectedLevel
    if (!levelMatch) return false

    const typeMatch = selectedType === 'all' ? true : entry.type_of_word === selectedType
    if (!typeMatch) return false

    const term = searchTerm.toLowerCase().trim()
    if (!term) return true

    return (
      entry.word.toLowerCase().includes(term) ||
      entry.meaning_vi.toLowerCase().includes(term) ||
      entry.meaning_en.toLowerCase().includes(term)
    )
  })

  const pagination = usePagination(filteredRows, 15)

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
  ]

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Vocabulary Management"
          title="Quản lý từ vựng"
          description="Kiểm soát vòng đời từ vựng từ lúc nhập liệu, rà soát đến khi phát hành vào nội dung học."
          actions={
            <>
              <Link to="/admin/vocabulary/new" className="btn btn-primary">Thêm từ vựng</Link>
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
                  <div className="col-12 col-md-auto">
                    <select
                      className="form-select"
                      value={selectedLessonId}
                      onChange={(e) => setSelectedLessonId(e.target.value)}
                    >
                      <option value="all">Tất cả bài học</option>
                      {lessonRows.map(lesson => (
                        <option key={lesson.id} value={lesson.id}>{lesson.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-auto">
                    <select
                      className="form-select"
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                      <option value="all">Tất cả mức độ</option>
                      <option value="Cơ bản">Cơ bản</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Nâng cao">Nâng cao</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-auto">
                    <select
                      className="form-select"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="all">Tất cả loại từ</option>
                      <option value="noun">Danh từ (Noun)</option>
                      <option value="verb">Động từ (Verb)</option>
                      <option value="adjective">Tính từ (Adjective)</option>
                      <option value="adverb">Trạng từ (Adverb)</option>
                      <option value="preposition">Giới từ (Preposition)</option>
                      <option value="conjunction">Liên từ (Conjunction)</option>
                    </select>
                  </div>
                  <div className="col-12 col-md">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="iconoir-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Tìm kiếm từ vựng..."
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
                  { key: 'type_of_word', label: 'Từ loại' },
                  { key: 'meaning_vi', label: 'Nghĩa Việt' },
                  {
                    key: 'lesson',
                    label: 'Bài học',
                    render: (row) => {
                      const lessonId = resolveLessonId(row, lessonRows)
                      const lessonName = lessonRows.find((lesson) => String(lesson.id) === String(lessonId))?.name || 'Chưa gán bài học'
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
                        <Link to={`/admin/vocabulary/${row.id}`} className="btn btn-sm btn-soft-info">Chi tiết</Link>
                        <Link to={`/admin/vocabulary/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                        <Link to={`/admin/vocabulary/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
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
