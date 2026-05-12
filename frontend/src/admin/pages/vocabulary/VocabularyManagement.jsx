import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessons, vocabularyEntries } from '../../data/adminData'
import {
  AdminPageHeader,
  AdminSectionCard,
} from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'
import { adminFetch } from '../../utils/api'
import { modal } from '../../../utils/modalUtils'

import { VocabularyStats } from './components/VocabularyStats'
import { VocabularyFilters } from './components/VocabularyFilters'
import { VocabularyTable } from './components/VocabularyTable'

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

/**
 * Component quản lý kho từ vựng tổng thể của hệ thống.
 * Cho phép Admin thực hiện: Tìm kiếm từ vựng, lọc theo loại từ/độ khó/bài học,
 * và theo dõi trạng thái phê duyệt (Nháp -> Chờ duyệt -> Đã duyệt).
 */
export function VocabularyManagement() {
  // Bộ lọc trạng thái duyệt (Tất cả, Đã duyệt, Chờ duyệt)
  const [activeFilter, setActiveFilter] = useState('Tất cả')
  
  // Danh sách từ vựng và bài học liên quan (để hiển thị thông tin bài học của từ)
  const [entries, setEntries] = useState(
    vocabularyEntries.map((entry) => ({ ...entry, status: normalizeStatus(entry.status) }))
  )
  const [lessonRows, setLessonRows] = useState(lessons)
  const [isLoading, setIsLoading] = useState(true)
  
  // Các trạng thái phục vụ bộ lọc nâng cao
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  // Dữ liệu thống kê kho từ vựng (phân loại theo từ loại, mức độ)
  const [statsData, setStatsData] = useState(null)

  useEffect(() => {
    let isDisposed = false

    async function loadData() {
      try {
        const [vocabularyResponse, lessonResponse, statsResponse] = await Promise.all([
          adminFetch(`/api/admin/vocabulary`),
          adminFetch(`/api/admin/lessons`),
          adminFetch(`/api/admin/reports/content-summary`),
        ])

        if (!vocabularyResponse.ok || !lessonResponse.ok) {
          throw new Error('Cannot fetch vocabulary/lesson data')
        }

        const [vocabularyPayload, lessonPayload] = await Promise.all([
          vocabularyResponse.json(),
          lessonResponse.json(),
        ])

        let statsPayload = null
        if (statsResponse.ok) {
          statsPayload = await statsResponse.json()
        }

        if (isDisposed) return

        setEntries(Array.isArray(vocabularyPayload)
          ? vocabularyPayload.map(normalizeVocabularyRow)
          : vocabularyEntries.map((entry) => ({ ...entry, status: normalizeStatus(entry.status) })))

        setLessonRows(Array.isArray(lessonPayload)
          ? lessonPayload.map(normalizeLessonRow)
          : lessons)

        if (statsPayload) {
          setStatsData(statsPayload.vocabulary)
        }
      } catch {
        if (isDisposed) return
        setEntries(vocabularyEntries.map((entry) => ({ ...entry, status: normalizeStatus(entry.status) })))
        setLessonRows(lessons)
        modal.error('Không thể tải từ vựng/bài học từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!isDisposed) {
          setIsLoading(false)
        }
      }
    }

    loadData()
    return () => { isDisposed = true }
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

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Vocabulary Management"
          title="Quản lý từ vựng"
          description="Kiểm soát vòng đời từ vựng từ lúc nhập liệu, rà soát đến khi phát hành vào nội dung học."
          actions={
            <Link to="/admin/vocabulary/new" className="btn btn-primary">Thêm từ vựng</Link>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu từ vựng từ backend...</div> : null}

        <VocabularyStats
          statsData={statsData}
          entries={entries}
          normalizeStatus={normalizeStatus}
        />

        <div className="row g-3 mt-1">
          <div className="col-12">
            <AdminSectionCard
              title="Kho từ vựng"
              description="Danh sách từ hiện có, cho phép lọc theo trạng thái duyệt để xử lý nhanh theo từng nhóm."
            >
              <VocabularyFilters
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                selectedLessonId={selectedLessonId}
                setSelectedLessonId={setSelectedLessonId}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                lessonRows={lessonRows}
              />

              <VocabularyTable
                pagination={pagination}
                lessonRows={lessonRows}
                resolveLessonId={resolveLessonId}
                normalizeStatus={normalizeStatus}
              />
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
