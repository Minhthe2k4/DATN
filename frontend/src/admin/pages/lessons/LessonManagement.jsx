import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessons as lessonSeed, topics } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard } from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'
import { adminFetch } from '../../utils/api'
import { modal } from '../../../utils/modalUtils'
import { 
  normalizeLessonRow, 
  normalizeTopicRow 
} from './utils/lessonUtils'
import { Plus } from 'lucide-react'

// Sub-components
import { LessonStats } from './components/LessonStats'
import { LessonFilters } from './components/LessonFilters'
import { LessonTable } from './components/LessonTable'
import { LessonSidebars } from './components/LessonSidebars'

/**
 * Component quản lý danh sách bài học dành cho Admin.
 * Hỗ trợ các chức năng: Xem danh sách bài học, lọc theo chủ đề/độ khó/Premium, 
 * và thống kê nhanh tình hình nội dung bài học.
 */
export function LessonManagement() {
  // Trạng thái lưu trữ danh sách bài học và chủ đề (lấy từ Backend hoặc Seed data)
  const [lessonRows, setLessonRows] = useState(lessonSeed)
  const [topicRows, setTopicRows] = useState(topics)
  const [isLoading, setIsLoading] = useState(true)
  
  // Các trạng thái phục vụ bộ lọc (Search, Topic, Difficulty, Premium, Status)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTopicId, setFilterTopicId] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [filterPremium, setFilterPremium] = useState('All')
  const [filterStatus, setFilterStatus] = useState('')

  // Dữ liệu thống kê bài học (số lượng, lượt xem, tỉ lệ hoàn thành)
  const [statsData, setStatsData] = useState(null)

  useEffect(() => {
    let isDisposed = false

    async function loadData() {
      try {
        const [lessonResponse, topicResponse, statsResponse] = await Promise.all([
          adminFetch(`/api/admin/lessons`),
          adminFetch(`/api/admin/topics`),
          adminFetch(`/api/admin/reports/content-summary`),
        ])

        if (!lessonResponse.ok || !topicResponse.ok) {
          throw new Error('Cannot fetch lesson/topic data')
        }

        const [lessonPayload, topicPayload] = await Promise.all([
          lessonResponse.json(),
          topicResponse.json(),
        ])
        
        let statsPayload = null
        if (statsResponse.ok) {
          statsPayload = await statsResponse.json()
        }

        if (isDisposed) return

        setLessonRows(Array.isArray(lessonPayload) ? lessonPayload.map(normalizeLessonRow) : lessonSeed)
        setTopicRows(Array.isArray(topicPayload) ? topicPayload.map(normalizeTopicRow) : topics)
        if (statsPayload) {
          setStatsData(statsPayload.lesson)
        }
      } catch (error) {
        if (isDisposed) return
        setLessonRows(lessonSeed)
        setTopicRows(topics)
        modal.error('Không thể tải bài học/chủ đề từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!isDisposed) setIsLoading(false)
      }
    }

    loadData()
    return () => { isDisposed = true }
  }, [])

  /**
   * Tính toán phân bổ độ khó của các bài học hiện có.
   * Kết quả được dùng để hiển thị biểu đồ tròn (Pie Chart) trong Sidebar.
   */
  const difficultyDistribution = useMemo(() => {
    const total = lessonRows.length
    const DIFFICULTIES = ['Dễ', 'Trung bình', ' Khó']
    
    return DIFFICULTIES.map((diff) => {
      const count = lessonRows.filter((l) => l.difficulty === diff).length
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0
      const tone = diff === 'Dễ' ? 'is-basic' : diff === 'Trung bình' ? 'is-mid' : 'is-advanced'

      return {
        difficulty: diff,
        count,
        ratio: percentage,
        tone,
      }
    })
  }, [lessonRows])

  /**
   * Lấy danh sách 5 bài học có lượt xem (views) cao nhất.
   */
  const topLessons = useMemo(() => {
    return [...lessonRows]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
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

    if (filterDifficulty) {
      result = result.filter(lesson => lesson.difficulty === filterDifficulty)
    }

    if (filterPremium !== 'All') {
      const isPrem = filterPremium === 'Premium'
      result = result.filter(lesson => lesson.isPremium === isPrem)
    }

    if (filterStatus) {
      result = result.filter(lesson => lesson.status === filterStatus)
    }

    return result
  }, [lessonRows, searchTerm, filterTopicId, filterDifficulty, filterPremium, filterStatus])

  const pagination = usePagination(filteredLessons, 10)

  return (
    <div className="page-content">
      <div className="container-fluid">
        <AdminPageHeader
          eyebrow="Lesson Management"
          title="Quản lý bài học"
          description="Thiết lập cấu trúc bài học theo chủ đề, độ khó và khối lượng học tập phù hợp."
          actions={
            <div className="d-flex gap-2">
              <Link to="/admin/lessons/new" className="btn btn-primary d-flex align-items-center gap-2">
                <Plus size={18} /> Thêm bài học
              </Link>
            </div>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu bài học từ backend...</div> : null}

        <LessonStats statsData={statsData} lessonRows={lessonRows} />

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-9">
            <AdminSectionCard title="Danh sách bài học" actions={<span className="badge bg-light text-primary border">{filteredLessons.length} bài học</span>}>
              <LessonFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterTopicId={filterTopicId}
                setFilterTopicId={setFilterTopicId}
                filterDifficulty={filterDifficulty}
                setFilterDifficulty={setFilterDifficulty}
                filterPremium={filterPremium}
                setFilterPremium={setFilterPremium}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                topicRows={topicRows}
              />
              
              <LessonTable 
                pagination={pagination}
                topicRows={topicRows}
              />
            </AdminSectionCard>
          </div>
          <div className="col-12 col-xl-3">
            <LessonSidebars 
              topLessons={topLessons}
              difficultyDistribution={difficultyDistribution}
            />
          </div>
        </div>
      </div>
    </div>
  )
}