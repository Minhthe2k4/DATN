import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessons as lessonSeed, topics } from '../../data/adminData'
import { AdminPageHeader, AdminSectionCard, Badge, SimpleTable, StatGrid, Pagination } from '../../components/console/AdminUi'
import { usePagination } from '../../hooks/usePagination'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function normalizeLessonRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    topic_id: row.topicId ?? row.topic_id ?? '',
    difficulty: row.difficulty ?? 'Trung bình',
    status: row.status ?? 'Đang mở',
    lessonImage: row.lessonImage ?? '',
    isPremium: !!row.isPremium,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function normalizeTopicRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export function LessonManagement() {
  const [lessonRows, setLessonRows] = useState(lessonSeed)
  const [topicRows, setTopicRows] = useState(topics)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTopicId, setFilterTopicId] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [filterPremium, setFilterPremium] = useState('All')
  const [filterStatus, setFilterStatus] = useState('')

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

        if (isDisposed) return

        setLessonRows(Array.isArray(lessonPayload) ? lessonPayload.map(normalizeLessonRow) : lessonSeed)
        setTopicRows(Array.isArray(topicPayload) ? topicPayload.map(normalizeTopicRow) : topics)
        setLoadError('')
      } catch (error) {
        if (isDisposed) return
        setLessonRows(lessonSeed)
        setTopicRows(topics)
        setLoadError('Không thể tải bài học/chủ đề từ backend, đang hiển thị dữ liệu mẫu.')
      } finally {
        if (!isDisposed) setIsLoading(false)
      }
    }

    loadLessonsAndTopics()
    return () => { isDisposed = true }
  }, [])

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
      label: 'Premium',
      value: lessonRows.filter((lesson) => lesson.isPremium).length.toString(),
      meta: 'Dành cho người dùng trả phí',
      icon: 'iconoir-star',
    },
    {
      label: 'Độ khó trung bình',
      value: lessonRows.filter((lesson) => lesson.difficulty === 'Trung bình').length.toString(),
      meta: 'Bài học ở mức trung bình',
      icon: 'iconoir-stats',
    },
  ]

  const difficultyDistribution = useMemo(() => {
    const total = lessonRows.length
    const DIFFICULTIES = ['Cơ bản', 'Trung bình', 'Nâng cao']

    return DIFFICULTIES.map((difficulty) => {
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
            <>
              <Link to="/admin/lessons/new" className="btn btn-primary">Thêm bài học</Link>
            </>
          }
        />

        {isLoading ? <div className="alert alert-light border">Đang tải dữ liệu bài học từ backend...</div> : null}
        {loadError ? <div className="alert alert-warning border">{loadError}</div> : null}

        <StatGrid items={stats} />

        <div className="row g-3 mt-1">
          <div className="col-12 col-xl-9">
            <AdminSectionCard title="Danh sách bài học" actions={<span className="badge bg-light text-primary border">{filteredLessons.length} bài học</span>}>
              <div className="mb-4">
                <div className="row g-2 mb-2">
                  <div className="col-12 col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="iconoir-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Tìm theo tên bài..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
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
                  <div className="col-12 col-md-4">
                    <select
                      className="form-select"
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                    >
                      <option value="">— Độ khó —</option>
                      <option value="Cơ bản">Cơ bản</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Nâng cao">Nâng cao</option>
                    </select>
                  </div>
                </div>
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <select
                      className="form-select"
                      value={filterPremium}
                      onChange={(e) => setFilterPremium(e.target.value)}
                    >
                      <option value="All">Tất cả gói</option>
                      <option value="Free">Miễn phí</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">— Trạng thái —</option>
                      <option value="Đang mở">Đang mở</option>
                      <option value="Tạm dừng">Tạm dừng</option>
                      <option value="Nháp">Bản nháp</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <SimpleTable
                columns={[
                  {
                    key: 'lessonImage',
                    label: 'Ảnh',
                    render: (row) => (
                      <img
                        src={row.lessonImage || 'https://via.placeholder.com/40'}
                        alt={row.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )
                  },
                  { 
                    key: 'name', 
                    label: 'Tên bài',
                    render: (row) => <span className="fw-bold">{row.name}</span>
                  },
                  {
                    key: 'topic',
                    label: 'Chủ đề',
                    render: (row) => {
                      const topicName = topicRows.find((t) => t.id === row.topic_id)?.name || '...'
                      return topicName
                    },
                  },
                  { key: 'difficulty', label: 'Độ khó' },
                  {
                    key: 'isPremium',
                    label: 'Loại',
                    render: (row) => row.isPremium ? <Badge tone="info">Premium</Badge> : <Badge tone="neutral">Free</Badge>
                  },
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
                        <Link to={`/admin/lessons/${row.id}`} className="btn btn-sm btn-soft-info">Chi tiết</Link>
                        <Link to={`/admin/lessons/${row.id}/edit`} className="btn btn-sm btn-soft-primary">Sửa</Link>
                        <Link to={`/admin/lessons/${row.id}/delete`} className="btn btn-sm btn-soft-danger">Xóa</Link>
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
          <div className="col-12 col-xl-3">
            <AdminSectionCard title="Phân bộ độ khó" description="Thống kê bài học">
              <div className="lesson-difficulty-grid">
                {difficultyDistribution.map((item) => (
                  <div className={`lesson-difficulty-item ${item.tone}`} key={item.difficulty}>
                    <div className="lesson-difficulty-item__header">
                      <span className="lesson-difficulty-item__label">{item.difficulty}</span>
                      <span className="lesson-difficulty-item__count">{item.count}</span>
                    </div>
                    <div className="lesson-difficulty-item__track" role="progressbar">
                      <div className="lesson-difficulty-item__fill" style={{ width: `${item.ratio}%` }}></div>
                    </div>
                    <div className="lesson-difficulty-item__meta">{Math.round(item.ratio)}%</div>
                  </div>
                ))}
              </div>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}